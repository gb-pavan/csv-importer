import OpenAI from 'openai';
import dotenv from 'dotenv';

import type {
  IAiExtractor,
  RawCsvRecord,
} from '../../domain/interfaces/IAiExtractor.js';

import {
  Lead,
  type CrmStatus,
  type DataSource,
} from '../../domain/entities/Lead.js';
import { leadExtractionSystemPrompt } from './LeadExtractionPrompt.js';

dotenv.config();

type NvidiaLeadResponse = {
  leads: Array<{
    created_at?: string | null;
    name?: string | null;
    email?: string | null;
    country_code?: string | null;
    mobile_without_country_code?: string | null;
    company?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    lead_owner?: string | null;
    crm_status?: CrmStatus | null;
    crm_note?: string | null;
    data_source?: DataSource | null;
    possession_time?: string | null;
    description?: string | null;
  }>;
};

class InvalidNvidiaResponseError extends Error {
  public readonly retryable = true;
}

const extractJsonObject = (content: string): string => {
  const fencedJson = content.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1] ?? content;
  const firstBrace = fencedJson.indexOf('{');
  const lastBrace = fencedJson.lastIndexOf('}');

  return firstBrace >= 0 && lastBrace >= firstBrace
    ? fencedJson.slice(firstBrace, lastBrace + 1)
    : fencedJson.trim();
};

export class NvidiaExtractor implements IAiExtractor {
  private client: OpenAI;

  constructor() {

    const apiKey = process.env.NVIDIA_API_KEY;

    if (!apiKey) {
      throw new Error('NVIDIA_API_KEY is missing');
    }

    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://integrate.api.nvidia.com/v1',
    });
  }

  public async extractRecords(
    batch: RawCsvRecord[],
  ): Promise<Lead[]> {
    const response = await this.client.chat.completions.create({
      model: process.env.NVIDIA_MODEL ?? 'meta/llama-3.1-70b-instruct',
      temperature: 0.1,
      max_tokens: 8192,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: leadExtractionSystemPrompt,
        },
        {
          role: 'user',
          content: JSON.stringify(batch),
        },
      ],
    });

    const content = response.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from NVIDIA model');
    }

    let parsed: NvidiaLeadResponse;

    try {
      parsed = JSON.parse(extractJsonObject(content));
    } catch {
      const finishReason = response.choices?.[0]?.finish_reason;
      const reason = finishReason === 'length'
        ? 'NVIDIA response was truncated before its JSON was complete.'
        : 'NVIDIA returned malformed JSON.';

      throw new InvalidNvidiaResponseError(reason);
    }

    if (!Array.isArray(parsed.leads)) {
      throw new InvalidNvidiaResponseError('NVIDIA response must contain a "leads" array.');
    }

    const extractedData = parsed.leads;

    return extractedData.map(
      (data) =>
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
          (data.crm_status ?? null) as CrmStatus,
          data.crm_note ?? null,
          (data.data_source ?? null) as DataSource,
          data.possession_time ?? null,
          data.description ?? null,
        ),
    );
  }
}
