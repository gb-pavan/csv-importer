import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

import type {
    IAiExtractor,
    RawCsvRecord,
} from "../../domain/interfaces/IAiExtractor.js";

import { Lead } from "../../domain/entities/Lead.js";
import { normalizeLead } from "../../domain/services/LeadNormalizer.js";
import { createLeadExtractionPrompt } from "./LeadExtractionPrompt.js";

dotenv.config();

const leadResponseSchema = {
    type: "object",
    additionalProperties: false,
    required: ["leads"],
    properties: {
        leads: {
            type: "array",
            items: {
                type: "object",
                additionalProperties: false,
                required: ["source_index"],
                properties: {
                    source_index: { type: "integer" },
                    created_at: { type: ["string", "null"] },
                    name: { type: ["string", "null"] },
                    email: { type: ["string", "null"] },
                    country_code: { type: ["string", "null"] },
                    mobile_without_country_code: { type: ["string", "null"] },
                    company: { type: ["string", "null"] },
                    city: { type: ["string", "null"] },
                    state: { type: ["string", "null"] },
                    country: { type: ["string", "null"] },
                    lead_owner: { type: ["string", "null"] },
                    crm_status: {
                        type: ["string", "null"],
                        enum: ["GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE", null],
                    },
                    crm_note: { type: ["string", "null"] },
                    data_source: {
                        type: ["string", "null"],
                        enum: ["leads_on_demand", "meridian_tower", "eden_park", "varah_swamy", "sarjapur_plots", null],
                    },
                    possession_time: { type: ["string", "null"] },
                    description: { type: ["string", "null"] },
                },
            },
        },
    },
};

type GeminiResponse = { leads: Record<string, unknown>[] };

class InvalidGeminiResponseError extends Error {
    public readonly retryable = true;
}

export class GeminiExtractor implements IAiExtractor {
    private ai: GoogleGenAI;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY_3;

        if (!apiKey) {
            throw new Error("GEMINI_API_KEY_3 is missing.");
        }

        this.ai = new GoogleGenAI({ apiKey });
    }

    public async extractRecords(batch: RawCsvRecord[]): Promise<Lead[]> {
        const prompt = createLeadExtractionPrompt(batch);

        const response = await this.ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseJsonSchema: leadResponseSchema,
                temperature: 0.1,
            },
        });

        const content = response.text;

        if (!content) {
            throw new Error("Empty response from Gemini.");
        }

        let parsed: GeminiResponse;
        try {
            parsed = JSON.parse(content) as GeminiResponse;
        } catch {
            // A malformed model response is transient; let the extraction retry obtain a fresh response.
            throw new InvalidGeminiResponseError("Gemini returned malformed JSON.");
        }

        if (!Array.isArray(parsed.leads)) {
            throw new InvalidGeminiResponseError('Gemini response must contain a "leads" array.');
        }

        const extractedData = parsed.leads;

        return extractedData.map(normalizeLead);
    }
}
