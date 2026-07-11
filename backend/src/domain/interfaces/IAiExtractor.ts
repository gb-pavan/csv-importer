import type { Lead } from "../entities/Lead.js";

// Represents a raw row from the CSV before processing
export type RawCsvRecord = Record<string, string>;

export interface IAiExtractor {
  /**
   * Takes a batch of raw CSV records and intelligently maps them to our Lead domain model.
   * @param batch Array of raw CSV rows
   * @returns Promise resolving to an array of processed Leads
   */
  extractRecords(batch: RawCsvRecord[]): Promise<Lead[]>;
}