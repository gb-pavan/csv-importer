export type CrmStatus = 'GOOD_LEAD_FOLLOW_UP' | 'DID_NOT_CONNECT' | 'BAD_LEAD' | 'SALE_DONE' | null;
export type DataSource = 'leads_on_demand' | 'meridian_tower' | 'eden_park' | 'varah_swamy' | 'sarjapur_plots' | null;

export class Lead {
  constructor(
    public readonly created_at: Date | null,
    public readonly name: string | null,
    public readonly email: string | null,
    public readonly country_code: string | null,
    public readonly mobile_without_country_code: string | null,
    public readonly company: string | null,
    public readonly city: string | null,
    public readonly state: string | null,
    public readonly country: string | null,
    public readonly lead_owner: string | null,
    public readonly crm_status: CrmStatus,
    public readonly crm_note: string | null,
    public readonly data_source: DataSource,
    public readonly possession_time: string | null,
    public readonly description: string | null
  ) {}

  // Domain logic: A lead is only valid if it has at least an email or mobile number
  isValid(): boolean {
    return (
      (this.email !== null && this.email.trim() !== '') ||
      (this.mobile_without_country_code !== null && this.mobile_without_country_code.trim() !== '')
    );
  }
}