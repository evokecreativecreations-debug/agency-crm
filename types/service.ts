/** Mirrors the approved "services" table in CRM_Blueprint_v2.md, Section 3.1.1. */
export interface Service {
  id: string;
  name: string;
  description: string | null;
  default_price: number | null;
  is_active: boolean;
  created_at: string;
}

export interface NewServiceInput {
  name: string;
  description?: string;
  default_price?: number;
}

export type ServiceUpdateInput = Partial<
  Pick<Service, "name" | "description" | "default_price" | "is_active">
>;
