/** Mirrors the "clients" table — see CRM_Blueprint_v2.md, Section 3. */

export interface Client {
  id: string;
  lead_id: string | null;
  full_name: string;
  company_name: string | null;
  email: string;
  phone: string | null;
  notes: string | null;
  created_at: string;
}

/** Fields required to create a client (from a lead conversion, or later, manually). */
export interface NewClientInput {
  lead_id?: string | null;
  full_name: string;
  company_name?: string;
  email: string;
  phone?: string;
  notes?: string;
}