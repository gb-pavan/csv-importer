import { ImportLeadsUseCase } from "../src/application/ImportLeadsUseCase.js";
import { Lead } from "../src/domain/entities/Lead.js";
import type { IAiExtractor, RawCsvRecord } from "../src/domain/interfaces/IAiExtractor.js";
import type { ILeadRepo } from "../src/domain/interfaces/ILeadRepo.js";

let attempts = 0;

const retryingExtractor: IAiExtractor = {
  async extractRecords(_batch: RawCsvRecord[]): Promise<Lead[]> {
    attempts += 1;

    if (attempts < 3) {
      throw Object.assign(new Error("Simulated rate limit"), { status: 429 });
    }

    return [new Lead(null, "Retry Test", "retry@example.com", null, null, null, null, null, null, null, null, null, null, null, null)];
  },
};

const inMemoryRepo: ILeadRepo = {
  async saveBatch(leads: Lead[]): Promise<number> {
    return leads.length;
  },
};

const useCase = new ImportLeadsUseCase(retryingExtractor, inMemoryRepo);
const result = await useCase.execute([{ email: "retry@example.com" }]);

if (attempts !== 3 || result.totalImported !== 1 || result.totalSkipped !== 0) {
  throw new Error(`Retry verification failed: ${JSON.stringify({ attempts, result })}`);
}

console.log("Retry verification passed: 2 transient failures were retried and 1 lead was imported.");
