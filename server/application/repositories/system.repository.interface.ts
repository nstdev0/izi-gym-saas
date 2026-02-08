import { Organization } from "@/server/domain/entities/Organization";
import { PageableRequest, PageableResponse } from "@/server/shared/common/pagination";
import { SystemStats } from "@/server/domain/types/system";
import { OrganizationsFilters } from "@/server/domain/types/organizations";

export interface ISystemRepository {
    getGlobalStats(): Promise<SystemStats>;
    getAllOrganizations(request: PageableRequest<OrganizationsFilters>): Promise<PageableResponse<Organization>>;
    suspendOrganization(organizationId: string, suspend: boolean): Promise<void>;
    getRecentSignups(): Promise<Organization[]>;
    getRevenueStats(): Promise<any>; // Define proper type
    getSystemConfig(): Promise<any>; // Define proper type
    updateSystemConfig(data: any): Promise<void>;
    getPlans(): Promise<any[]>; // Define proper type
    createPlan(data: any): Promise<void>;
    updatePlan(id: string, data: any): Promise<void>;
}
