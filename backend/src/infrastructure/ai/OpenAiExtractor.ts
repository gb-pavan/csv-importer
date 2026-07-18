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
import { Lead } from '../../domain/entities/Lead.js';
import { normalizeLead } from '../../domain/services/LeadNormalizer.js';
import { leadExtractionSystemPrompt } from './LeadExtractionPrompt.js';

dotenv.config();

export class OpenAiExtractor implements IAiExtractor {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    public async extractRecords(batch: RawCsvRecord[]): Promise<Lead[]> {
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini', // Fast, cheap, excellent at JSON
            response_format: { type: 'json_object' },
            temperature: 0.1, // Low temperature for deterministic mapping
            messages: [
                { role: 'system', content: leadExtractionSystemPrompt },
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
        return extractedData.map(normalizeLead);
    }
}
