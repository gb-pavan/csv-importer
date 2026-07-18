// import { ILeadRepo } from '../../domain/interfaces/ILeadRepo';
// import { Lead } from '../../domain/entities/Lead';
// import { supabase } from './supabaseClient';

import type { Lead } from "../../domain/entities/Lead.js";
import type { ILeadRepo } from "../../domain/interfaces/ILeadRepo.js";
import { supabase } from "./supabaseClient.js";

export class SupabaseLeadRepo implements ILeadRepo {
  public async saveBatch(leads: Lead[]): Promise<number> {
    if (leads.length === 0) return 0;

    // Map domain entities to plain objects for the database insert
    const recordsToInsert = leads.map(lead => ({
      created_at: lead.created_at,
      name: lead.name,
      email: lead.email,
      country_code: lead.country_code,
      mobile_without_country_code: lead.mobile_without_country_code,
      company: lead.company,
      city: lead.city,
      state: lead.state,
      country: lead.country,
      lead_owner: lead.lead_owner,
      crm_status: lead.crm_status,
      crm_note: lead.crm_note,
      data_source: lead.data_source,
      possession_time: lead.possession_time,
      description: lead.description
    }));

    const { data, error } = await supabase
      .from('leads')
      // The email column has a unique constraint.  Re-importing a CSV should be
      // safe, so retain the existing row and insert only genuinely new leads.
      .upsert(recordsToInsert, { onConflict: 'email', ignoreDuplicates: true })
      .select('email');

    if (error) {
      console.error('Supabase insertion error:', error.message);
      throw new Error(`Database error: ${error.message}`);
    }

    return data?.length ?? 0;
  }
}
