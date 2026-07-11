// import { IAiExtractor, RawCsvRecord } from '../domain/interfaces/IAiExtractor';
// import { ILeadRepo } from '../domain/interfaces/ILeadRepo';
// import { Lead } from '../domain/entities/Lead';

import type { Lead } from "../domain/entities/Lead.js";
import type { IAiExtractor, RawCsvRecord } from "../domain/interfaces/IAiExtractor.js";
import type { ILeadRepo } from "../domain/interfaces/ILeadRepo.js";

export class ImportLeadsUseCase {
  // Batch size of 20-50 is usually optimal for LLM prompt context windows
  private readonly BATCH_SIZE = 25; 

  constructor(
    private readonly aiExtractor: IAiExtractor,
    private readonly leadRepo: ILeadRepo
  ) {}

  public async execute(rawRecords: RawCsvRecord[]) {
    let totalImported = 0;
    let totalSkipped = 0;
    const successfullyParsed: Lead[] = [];

    // Process in batches to avoid overloading the AI or hitting token limits 
    for (let i = 0; i < rawRecords.length; i += this.BATCH_SIZE) {
      const batch = rawRecords.slice(i, i + this.BATCH_SIZE);
      
      try {
        // 1. Send unstructured batch to AI for intelligent mapping
        const extractedLeads = await this.aiExtractor.extractRecords(batch);

        // 2. Validate using Domain logic (must have email or mobile) [cite: 128-133]
        const validLeads = extractedLeads.filter(lead => lead.isValid());
        const skippedInBatch = batch.length - validLeads.length;

        // 3. Save valid leads to the database
        if (validLeads.length > 0) {
          const savedCount = await this.leadRepo.saveBatch(validLeads);
          totalImported += savedCount;
          successfullyParsed.push(...validLeads);
        }

        totalSkipped += skippedInBatch;
      } catch (error) {
        console.error(`AI Extraction failed for batch ${i / this.BATCH_SIZE + 1}:`, error);
        // If a whole batch fails (e.g., rate limit hit and retries exhausted), count them all as skipped
        totalSkipped += batch.length;
      }
    }

    return {
      totalImported,
      totalSkipped,
      successfullyParsed
    };
  }
}