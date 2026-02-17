export interface CreateOrganizationInput {
  name: string;
  slug: string;
  planSlug?: string;
  planId?: string;
  planName?: string;
  config?: unknown
}

export type UpdateOrganizationInput = Partial<CreateOrganizationInput>;

export interface OrganizationsFilters {
  search?: string;
  sort?: string;
  status?: string;
}
