import express from 'express';
import cors from 'cors';
import multer from 'multer';
import type { CsvParserService } from '../application/CsvParserService.js';
import type { ImportLeadsUseCase } from '../application/ImportLeadsUseCase.js';

export type AppDependencies = {
  parserService: Pick<CsvParserService, 'parse'>;
  importUseCase: Pick<ImportLeadsUseCase, 'execute'>;
};

export const createApp = ({ parserService, importUseCase }: AppDependencies) => {
  const app = express();
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
  });

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.post('/api/upload', upload.single('csv_file'), async (req, res): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded.' });
        return;
      }

      if (!req.file.originalname.toLowerCase().endsWith('.csv')) {
        res.status(415).json({ error: 'Only CSV files are supported.' });
        return;
      }

      if (req.file.size === 0) {
        res.status(400).json({ error: 'The uploaded CSV file is empty.' });
        return;
      }

      const rawRecords = await parserService.parse(req.file.buffer.toString('utf-8'));
      const result = await importUseCase.execute(rawRecords);
      res.status(200).json(result);
    } catch (error: unknown) {
      console.error('Upload route error:', error);
      const candidate = error as { status?: number; message?: string };
      const status = candidate?.status === 429 ? 429 : candidate?.message?.startsWith('Invalid CSV:') ? 400 : 500;
      const errorMessage = status === 429
        ? 'AI provider quota is exhausted. Wait for the quota to reset or enable billing, then try again.'
        : candidate?.message || 'Internal server error';

      res.status(status).json({ error: errorMessage });
    }
  });

  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({ error: 'CSV files must be 10 MB or smaller.' });
      return;
    }

    console.error('Request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
};
