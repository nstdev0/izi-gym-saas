export interface CreateOrganizationInput {
  name: string;
  slug: string;
}

export type UpdateOrganizationInput = Partial<CreateOrganizationInput>;

export interface OrganizationsFilters {
  search?: string;
}
