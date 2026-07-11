// import type { Lead } from "../../domain/entities/Lead.js";

// // Represents a raw row from the CSV before processing
// export type RawCsvRecord = Record<string, string>;

// export interface IAiExtractor {
//   /**
//    * Takes a batch of raw CSV records and intelligently maps them to our Lead domain model.
//    * @param batch Array of raw CSV rows
//    * @returns Promise resolving to an array of processed Leads
//    */
//   extractRecords(batch: RawCsvRecord[]): Promise<Lead[]>;
// }

import OpenAI from 'openai';
import dotenv from 'dotenv';
// import type { CrmStatus, DataSource, Lead } from '../../domain/entities/Lead.js';
import type { IAiExtractor, RawCsvRecord } from '../../domain/interfaces/IAiExtractor.js';
import { Lead, type CrmStatus, type DataSource } from '../../domain/entities/Lead.js';

dotenv.config();

export class OpenAiExtractor implements IAiExtractor {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    public async extractRecords(batch: RawCsvRecord[]): Promise<Lead[]> {
        const systemPrompt = `
      You are an intelligent data extraction assistant for a CRM system.
      Convert the following array of raw CSV JSON records into structured CRM Lead records.
      
      CRITICAL RULES:
      1. crm_status MUST be exactly one of: GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE.
      2. data_source MUST be exactly one of: leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots. Leave null if unsure.
      3. If multiple emails exist, put the first in 'email' and append the rest to 'crm_note'.
      4. If multiple phone numbers exist, put the first in 'mobile_without_country_code' and append the rest to 'crm_note'.
      5. Any extra useful info should go into 'crm_note'.
      
      Return a JSON object with a single root key "leads" containing an array of the structured records.
    `;

        const response = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini', // Fast, cheap, excellent at JSON
            response_format: { type: 'json_object' },
            temperature: 0.1, // Low temperature for deterministic mapping
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: JSON.stringify(batch) }
            ],
        });

        // const content = response.choices[0].message.content;
        const choice = response.choices.at(0);

        if (!choice?.message.content) {
            throw new Error('Empty response from AI.');
        }

        const content = choice.message.content;
        if (!content) throw new Error('Empty response from AI.');

        const parsed = JSON.parse(content);
        const extractedData: any[] = parsed.leads || [];

        // Map the raw JSON back into our strict Domain Entity
        return extractedData.map(data => new Lead(
            data.created_at ? new Date(data.created_at) : null,
            data.name || null,
            data.email || null,
            data.country_code || null,
            data.mobile_without_country_code || null,
            data.company || null,
            data.city || null,
            data.state || null,
            data.country || null,
            data.lead_owner || null,
            data.crm_status as CrmStatus,
            data.crm_note || null,
            data.data_source as DataSource,
            data.possession_time || null,
            data.description || null
        ));
    }
}