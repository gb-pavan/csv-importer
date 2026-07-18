import { Lead, type CrmStatus, type DataSource } from "../entities/Lead.js";

const crmStatuses = new Set<CrmStatus>([
  "GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE", null,
]);
const dataSources = new Set<DataSource>([
  "leads_on_demand", "meridian_tower", "eden_park", "varah_swamy", "sarjapur_plots", null,
]);

export type ExtractedLead = Record<string, unknown>;

const asNullableString = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

const asDate = (value: unknown): Date | null => {
  const dateValue = asNullableString(value);
  if (!dateValue) return null;
  const date = new Date(dateValue);
  return Number.isNaN(date.getTime()) ? null : date;
};

const asCrmStatus = (value: unknown): CrmStatus => {
  const status = asNullableString(value) as CrmStatus;
  return crmStatuses.has(status) ? status : null;
};

const asDataSource = (value: unknown): DataSource => {
  const source = asNullableString(value) as DataSource;
  return dataSources.has(source) ? source : null;
};

const asNote = (value: unknown): string | null =>
  asNullableString(value)?.replace(/\r?\n/g, "\\n") ?? null;

export const normalizeLead = (data: ExtractedLead): Lead => new Lead(
  asDate(data.created_at), asNullableString(data.name), asNullableString(data.email),
  asNullableString(data.country_code), asNullableString(data.mobile_without_country_code),
  asNullableString(data.company), asNullableString(data.city), asNullableString(data.state),
  asNullableString(data.country), asNullableString(data.lead_owner), asCrmStatus(data.crm_status),
  asNote(data.crm_note), asDataSource(data.data_source), asNullableString(data.possession_time),
  asNullableString(data.description),
);
