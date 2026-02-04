export interface CreateOrganizationInput {
  name: string;
  slug: string;
  planSlug?: string;
}

export type UpdateOrganizationInput = Partial<CreateOrganizationInput>;

export interface OrganizationsFilters {
  search?: string;
}
