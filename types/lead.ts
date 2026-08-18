/** Mirrors the "leads" table — see CRM_Blueprint_v2.md, Section 3. */

export type LeadStatus = "contacted" | "negotiating" | "won" | "lost";

export interface Lead {
  id: string;
  inquiry_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  notes: string | null;
  status: LeadStatus;
  created_at: string;
}

/** Fields required to create a lead (from an inquiry conversion, or later, manually). */
export interface NewLeadInput {
  inquiry_id?: string | null;
  full_name: string;
  email: string;
  phone?: string | null;
  notes?: string;
}