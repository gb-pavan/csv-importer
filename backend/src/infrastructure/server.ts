import dotenv from 'dotenv';
import { CsvParserService } from '../application/CsvParserService.js';
import { createAiExtractor } from './ai/AiProviderFactory.js';
import { SupabaseLeadRepo } from './database/SupabaseLeadRepo.js';
import { ImportLeadsUseCase } from '../application/ImportLeadsUseCase.js';
import { createApp } from './app.js';

dotenv.config();

const port = process.env.PORT || 3001;

// Dependency Injection Initialization
const parserService = new CsvParserService();
const aiExtractor = createAiExtractor();
const leadRepo = new SupabaseLeadRepo();
const importUseCase = new ImportLeadsUseCase(aiExtractor, leadRepo);
const app = createApp({ parserService, importUseCase });

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
