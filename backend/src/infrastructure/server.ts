import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { CsvParserService } from '../application/CsvParserService.js';
// Remove this: import { OpenAiExtractor } from './ai/OpenAiExtractor.js';
import { GeminiExtractor } from './ai/GeminiExtractor.js';
import { OpenAiExtractor } from './ai/OpenAiExtractor.js';
import { SupabaseLeadRepo } from './database/SupabaseLeadRepo.js';
import { ImportLeadsUseCase } from '../application/ImportLeadsUseCase.js';
// import { CsvParserService } from '../application/CsvParserService';
// import { ImportLeadsUseCase } from '../application/ImportLeadsUseCase';
// import { OpenAiExtractor } from './ai/OpenAiExtractor';
// import { SupabaseLeadRepo } from './database/SupabaseLeadRepo';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Memory storage for CSV upload (avoids writing to disk)
const upload = multer({ storage: multer.memoryStorage() });

// Dependency Injection Initialization
const parserService = new CsvParserService();
const aiExtractor = new GeminiExtractor();
const leadRepo = new SupabaseLeadRepo();
const importUseCase = new ImportLeadsUseCase(aiExtractor, leadRepo);

// API Routes
app.post('/api/upload', upload.single('csv_file'), async (req, res): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded.' });
      return;
    }

    const csvString = req.file.buffer.toString('utf-8');
    
    // 1. Parse raw string to JSON
    const rawRecords = await parserService.parse(csvString);
    
    // 2. Execute business logic (AI mapping + DB insertion)
    const result = await importUseCase.execute(rawRecords);
    
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Upload route error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});