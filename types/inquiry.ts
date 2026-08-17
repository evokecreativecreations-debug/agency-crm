/** Mirrors the "inquiries" table — see CRM_Blueprint_v2.md, Section 3. */

export type InquiryStatus = "new" | "reviewed" | "converted_to_lead" | "discarded";
export type InquirySource = "website_form" | "manual";

export interface Inquiry {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  message: string;
  source: InquirySource;
  status: InquiryStatus;
  created_at: string;
}

/** Fields required to create an inquiry manually from inside the CRM. */
export interface NewInquiryInput {
  full_name: string;
  email: string;
  phone?: string;
  message: string;
}