import { expect, it } from '@jest/globals';
import { normalizeLead } from "./LeadNormalizer.js";

it("normalizes malformed AI values to safe CRM values", () => {
  const lead = normalizeLead({
    created_at: "not a date", email: "  jane@example.com ", crm_status: "PENDING",
    data_source: "unknown", crm_note: "Call back\ntomorrow",
  });

  expect(lead.created_at).toBeNull();
  expect(lead.email).toBe("jane@example.com");
  expect(lead.crm_status).toBeNull();
  expect(lead.data_source).toBeNull();
  expect(lead.crm_note).toBe("Call back\\ntomorrow");
  expect(lead.isValid()).toBe(true);
});
