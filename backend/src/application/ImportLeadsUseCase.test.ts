import assert from "node:assert/strict";
import test from "node:test";
import { ImportLeadsUseCase } from "./ImportLeadsUseCase.js";
import { Lead } from "../domain/entities/Lead.js";
import type { IAiExtractor } from "../domain/interfaces/IAiExtractor.js";
import type { ILeadRepo } from "../domain/interfaces/ILeadRepo.js";

test("caps AI output at the source batch size and accurately reports skipped rows", async () => {
  const validLead = new Lead(null, "Jane", "jane@example.com", null, null, null, null, null, null, null, null, null, null, null, null);
  const ai: IAiExtractor = { extractRecords: async () => [validLead, validLead, validLead] };
  const repository: ILeadRepo = { saveBatch: async (leads) => leads.length };
  const useCase = new ImportLeadsUseCase(ai, repository);

  const result = await useCase.execute([{ email: "jane@example.com" }, { name: "No contact" }]);

  assert.equal(result.totalImported, 2);
  assert.equal(result.totalSkipped, 0);
  assert.equal(result.successfullyParsed.length, 2);
});

test("processes records over 25 rows in separate AI batches", async () => {
  const validLead = new Lead(null, "Jane", "jane@example.com", null, null, null, null, null, null, null, null, null, null, null, null);
  const batchSizes: number[] = [];
  const ai: IAiExtractor = {
    extractRecords: async (batch) => {
      batchSizes.push(batch.length);
      return batch.map(() => validLead);
    },
  };
  const repository: ILeadRepo = { saveBatch: async (leads) => leads.length };
  const rows = Array.from({ length: 26 }, (_, index) => ({ email: `lead-${index}@example.com` }));

  const result = await new ImportLeadsUseCase(ai, repository).execute(rows);

  assert.deepEqual(batchSizes, [25, 1]);
  assert.equal(result.batchesProcessed, 2);
  assert.equal(result.totalImported, 26);
});
