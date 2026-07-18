import assert from "node:assert/strict";
import test from "node:test";
import { CsvParserService } from "./CsvParserService.js";

test("rejects an empty or malformed CSV before AI processing", async () => {
  const parser = new CsvParserService();

  await assert.rejects(() => parser.parse("name,email\n"), /at least one data row/);
  await assert.rejects(() => parser.parse('name,email\n"Jane,jane@example.com'), /Invalid CSV/);
});

test("parses valid CSV values with quoted commas", async () => {
  const parser = new CsvParserService();
  const records = await parser.parse('Full Name,Notes\nJane Doe,"Call, then email"');

  assert.deepEqual(records, [{ "full name": "Jane Doe", notes: "Call, then email" }]);
});
