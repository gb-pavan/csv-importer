import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

import type {
    IAiExtractor,
    RawCsvRecord,
} from "../../domain/interfaces/IAiExtractor.js";

import {
    Lead,
    type CrmStatus,
    type DataSource,
} from "../../domain/entities/Lead.js";

dotenv.config();

export class GeminiExtractor implements IAiExtractor {
    private ai: GoogleGenAI;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is missing.");
        }

        this.ai = new GoogleGenAI({ apiKey });
    }

    public async extractRecords(batch: RawCsvRecord[]): Promise<Lead[]> {
        const prompt = `
You are an intelligent data extraction assistant for a CRM system.

Convert the following array of raw CSV JSON records into structured CRM Lead records.

Rules:

1. crm_status MUST be one of:
GOOD_LEAD_FOLLOW_UP
DID_NOT_CONNECT
BAD_LEAD
SALE_DONE

2. data_source MUST be one of:
leads_on_demand
meridian_tower
eden_park
varah_swamy
sarjapur_plots

If unsure, return null.

3. If multiple emails exist:
- first -> email
- remaining -> crm_note

4. If multiple phone numbers exist:
- first -> mobile_without_country_code
- remaining -> crm_note

5. Put any extra useful information into crm_note.

Return ONLY valid JSON.

Format:

{
  "leads": [
    {
      "created_at": null,
      "name": null,
      "email": null,
      "country_code": null,
      "mobile_without_country_code": null,
      "company": null,
      "city": null,
      "state": null,
      "country": null,
      "lead_owner": null,
      "crm_status": null,
      "crm_note": null,
      "data_source": null,
      "possession_time": null,
      "description": null
    }
  ]
}

CSV DATA:

${JSON.stringify(batch)}
`;

        const response = await this.ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.1,
            },
        });

        const content = response.text;

        if (!content) {
            throw new Error("Empty response from Gemini.");
        }

        const parsed = JSON.parse(content);

        const extractedData = parsed.leads ?? [];

        return extractedData.map(
            (data: any) =>
                new Lead(
                    data.created_at ? new Date(data.created_at) : null,
                    data.name ?? null,
                    data.email ?? null,
                    data.country_code ?? null,
                    data.mobile_without_country_code ?? null,
                    data.company ?? null,
                    data.city ?? null,
                    data.state ?? null,
                    data.country ?? null,
                    data.lead_owner ?? null,
                    data.crm_status as CrmStatus,
                    data.crm_note ?? null,
                    data.data_source as DataSource,
                    data.possession_time ?? null,
                    data.description ?? null
                )
        );
    }
}