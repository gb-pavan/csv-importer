import Papa from 'papaparse';
import type { RawCsvRecord } from '../domain/interfaces/IAiExtractor.js';
// import { RawCsvRecord } from '../domain/interfaces/IAiExtractor';

export class CsvParserService {
  /**
   * Parses a raw CSV string into an array of key-value objects.
   * Uses PapaParse to handle tricky edge cases like commas inside quotes.
   */
  public async parse(csvString: string): Promise<RawCsvRecord[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(csvString, {
        header: true, // Automatically uses the first row as object keys
        skipEmptyLines: true,
        transformHeader: (header) => header.trim().toLowerCase(), // Normalize headers a bit
        complete: (results) => {
          const fatalError = results.errors.find((error) => error.type === 'Quotes');
          if (fatalError) {
            reject(new Error(`Invalid CSV: ${fatalError.message}`));
            return;
          }

          if (!results.meta.fields?.some((field) => field.trim() !== '')) {
            reject(new Error('Invalid CSV: a header row is required.'));
            return;
          }

          if (results.data.length === 0) {
            reject(new Error('Invalid CSV: add at least one data row.'));
            return;
          }

          if (results.errors.length > 0) {
            console.warn('CSV parsing warnings:', results.errors);
          }
          resolve(results.data as RawCsvRecord[]);
        },
        error: (error: Error) => {
          reject(new Error(`Failed to parse CSV: ${error.message}`));
        }
      });
    });
  }
}
