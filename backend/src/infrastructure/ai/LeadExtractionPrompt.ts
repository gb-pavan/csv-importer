import type { RawCsvRecord } from '../../domain/interfaces/IAiExtractor.js';

export const leadExtractionSystemPrompt = `
You extract CRM leads from arbitrary CSV records. Source columns can use different
names, layouts, and formats (for example, "Full Name", "Phone", "Remarks", or
"Lead Created"). Infer the most appropriate mapping from the data; do not invent
information that is not present.

Return only a JSON object with this shape:
{"leads":[{"created_at":null,"name":null,"email":null,"country_code":null,"mobile_without_country_code":null,"company":null,"city":null,"state":null,"country":null,"lead_owner":null,"crm_status":null,"crm_note":null,"data_source":null,"possession_time":null,"description":null}]}

For every output lead, include only these fields. Use a string when a value is
known; otherwise use null. Do not include markdown, explanations, or extra keys.

Mapping rules:
1. Extract as many CRM fields as possible: created_at, name, email, country_code,
   mobile_without_country_code, company, city, state, country, lead_owner,
   crm_status, crm_note, data_source, possession_time, and description.
2. created_at must be an ISO-8601 date/time or another format accepted by
   JavaScript new Date().
3. crm_status must be exactly one of GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT,
   BAD_LEAD, or SALE_DONE. Use null when it cannot be determined confidently.
4. data_source must be exactly one of leads_on_demand, meridian_tower, eden_park,
   varah_swamy, or sarjapur_plots. Use null when it cannot be determined
   confidently.
5. Put remarks, follow-up details, comments, and useful unmatched data in
   crm_note. Keep notes as a single string; represent any line break as the
   escaped characters \\n rather than a literal line break.
6. When a record has multiple emails, use the first as email and append the
   others to crm_note. When it has multiple mobile numbers, use the first as
   mobile_without_country_code and append the others to crm_note.
7. Omit a source record completely when it contains neither a usable email nor a
   usable mobile number. Do not omit records that have either one.
`;

export const createLeadExtractionPrompt = (batch: RawCsvRecord[]): string =>
  `${leadExtractionSystemPrompt}\n\nCSV records to extract:\n${JSON.stringify(batch)}`;
