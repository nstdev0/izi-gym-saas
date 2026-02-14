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
  createWithTransaction(
    input: CreateOrganizationInput,
    userId: string,
  ): Promise<Organization>;
  findCurrent(): Promise<Organization | null>;
  upgradePlan(planSlug: string): Promise<Organization>;
}
