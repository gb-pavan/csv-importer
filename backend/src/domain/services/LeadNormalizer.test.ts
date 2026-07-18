import assert from "node:assert/strict";
import test from "node:test";
import { normalizeLead } from "./LeadNormalizer.js";

test("normalizes malformed AI values to safe CRM values", () => {
  const lead = normalizeLead({
    created_at: "not a date", email: "  jane@example.com ", crm_status: "PENDING",
    data_source: "unknown", crm_note: "Call back\ntomorrow",
  });

  assert.equal(lead.created_at, null);
  assert.equal(lead.email, "jane@example.com");
  assert.equal(lead.crm_status, null);
  assert.equal(lead.data_source, null);
  assert.equal(lead.crm_note, "Call back\\ntomorrow");
  assert.equal(lead.isValid(), true);
});
