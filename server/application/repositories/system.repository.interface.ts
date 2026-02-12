import { Organization } from "@/server/domain/entities/Organization";
import { OrganizationPlan } from "@/server/domain/entities/OrganizationPlan";
import { PageableRequest, PageableResponse } from "@/server/shared/common/pagination";
import { SystemStats, RevenueStats, SystemConfig } from "@/server/domain/types/system";
import { OrganizationsFilters } from "@/server/domain/types/organizations";
import { CreatePlanInput, UpdatePlanInput } from "@/server/domain/types/plans";

export interface ISystemRepository {
    getGlobalStats(): Promise<SystemStats>;
    getAllOrganizations(request: PageableRequest<OrganizationsFilters>): Promise<PageableResponse<Organization>>;
    suspendOrganization(organizationId: string, suspend: boolean): Promise<void>;
    getRecentSignups(): Promise<Organization[]>;
    getRevenueStats(): Promise<RevenueStats[]>;
    getSystemConfig(): Promise<SystemConfig>;
    updateSystemConfig(data: Partial<SystemConfig>): Promise<void>;
    getPlans(): Promise<OrganizationPlan[]>;
    createPlan(data: CreatePlanInput): Promise<void>;
    updatePlan(id: string, data: UpdatePlanInput): Promise<void>;
}
