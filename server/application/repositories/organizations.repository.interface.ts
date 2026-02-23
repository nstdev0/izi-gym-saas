import { Organization } from "@/server/domain/entities/Organization";
import {
  CreateOrganizationInput,
  UpdateOrganizationInput,
  OrganizationsFilters,
} from "@/server/domain/types/organizations";
import { IBaseRepository } from "./base.repository.interface";

export type {
  CreateOrganizationInput,
  UpdateOrganizationInput,
  OrganizationsFilters,
};

export interface IOrganizationRepository extends IBaseRepository<
  Organization,
  CreateOrganizationInput,
  UpdateOrganizationInput,
  OrganizationsFilters
> {
  findCurrent(): Promise<Organization | null>;
  updateSettings(id: string, settings: any): Promise<Organization>;
  findBySlug(slug: string): Promise<Organization | null>;
  findByIdWithPlan(id: string): Promise<Organization | null>;
  findOrganizationPlanBySlug(slug: string): Promise<{ id: string; name: string; price: number } | null>;
}
