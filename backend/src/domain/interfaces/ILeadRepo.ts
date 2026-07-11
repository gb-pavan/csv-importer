import type { Lead } from "../../domain/entities/Lead.js";

export interface ILeadRepo {
  /**
   * Saves a batch of validated leads to the database.
   * @param leads Array of Lead domain entities
   * @returns Promise resolving to the number of successfully saved records
   */
  saveBatch(leads: Lead[]): Promise<number>;
}