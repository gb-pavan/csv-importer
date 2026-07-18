import { expect, it } from '@jest/globals';
import { CsvParserService } from "./CsvParserService.js";

it("rejects an empty or malformed CSV before AI processing", async () => {
  const parser = new CsvParserService();

  await expect(parser.parse("name,email\n")).rejects.toThrow(/at least one data row/);
  await expect(parser.parse('name,email\n"Jane,jane@example.com')).rejects.toThrow(/Invalid CSV/);
});

it("parses valid CSV values with quoted commas", async () => {
  const parser = new CsvParserService();
  const records = await parser.parse('Full Name,Notes\nJane Doe,"Call, then email"');

  expect(records).toEqual([{ "full name": "Jane Doe", notes: "Call, then email" }]);
});
