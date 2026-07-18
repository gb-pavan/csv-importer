import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { CsvParserService } from '../application/CsvParserService.js';
import { createAiExtractor } from './ai/AiProviderFactory.js';
import { SupabaseLeadRepo } from './database/SupabaseLeadRepo.js';
import { ImportLeadsUseCase } from '../application/ImportLeadsUseCase.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Memory storage for CSV upload (avoids writing to disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Dependency Injection Initialization
const parserService = new CsvParserService();
const aiExtractor = createAiExtractor();
const leadRepo = new SupabaseLeadRepo();
const importUseCase = new ImportLeadsUseCase(aiExtractor, leadRepo);

// API Routes
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

    const csvString = req.file.buffer.toString('utf-8');
    
    // 1. Parse raw string to JSON
    const rawRecords = await parserService.parse(csvString);
    
    // 2. Execute business logic (AI mapping + DB insertion)
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

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
