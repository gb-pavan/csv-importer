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
