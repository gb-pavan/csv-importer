// import { IAiExtractor, RawCsvRecord } from '../domain/interfaces/IAiExtractor';
// import { ILeadRepo } from '../domain/interfaces/ILeadRepo';
// import { Lead } from '../domain/entities/Lead';

import type { Lead } from "../domain/entities/Lead.js";
import type { IAiExtractor, RawCsvRecord } from "../domain/interfaces/IAiExtractor.js";
import type { ILeadRepo } from "../domain/interfaces/ILeadRepo.js";
import { ExponentialBackoffRetry } from "./ExponentialBackoffRetry.js";

export class ImportLeadsUseCase {
  // Batch size of 20-50 is usually optimal for LLM prompt context windows
  private readonly BATCH_SIZE = 25; 
  private readonly retry = new ExponentialBackoffRetry();

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
        const batchNumber = i / this.BATCH_SIZE + 1;
        const extractedLeads = await this.retry.execute(
          () => this.aiExtractor.extractRecords(batch),
          `AI extraction for batch ${batchNumber}`,
        );

        // 2. Validate using Domain logic (must have email or mobile) [cite: 128-133]
        // A provider must not be able to inflate the import result by returning
        // more leads than the source batch contains.
        const validLeads = extractedLeads.slice(0, batch.length).filter(lead => lead.isValid());
        const skippedInBatch = batch.length - validLeads.length;

        // 3. Save valid leads to the database
        if (validLeads.length > 0) {
          const savedCount = await this.leadRepo.saveBatch(validLeads);
          totalImported += savedCount;
          successfullyParsed.push(...validLeads);
        }

        totalSkipped += skippedInBatch;
      } catch (error) {
        if (this.isRateLimited(error)) {
          // Do not make the same quota-exhausted request for every remaining
          // batch, and allow the HTTP layer to report the real cause to users.
          throw error;
        }

        console.error(`AI extraction failed after retries for batch ${i / this.BATCH_SIZE + 1}:`, error);
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

  private isRateLimited(error: unknown): boolean {
    const candidate = error as { status?: number; message?: string };

    return candidate?.status === 429;
  }
}
