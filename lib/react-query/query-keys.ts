import { removeEmptyParams } from "@/lib/utils";
import { AttendanceFilters } from "@/shared/types/attendance.types";
import { MembersFilters } from "@/shared/types/members.types";
import { MembershipsFilters } from "@/shared/types/memberships.types";
import { OrganizationsFilters } from "@/shared/types/organizations.types";
import { PlansFilters } from "@/shared/types/plans.types";
import { ProductsFilters } from "@/shared/types/products.types";
import { UsersFilters } from "@/shared/types/users.types";
import { PageableRequest } from "@/shared/types/pagination.types";

export const attendanceKeys = {
    all: ['attendance'] as const,
    lists: () => [...attendanceKeys.all, 'list'] as const,
    list: (filters: PageableRequest<AttendanceFilters>) => [...attendanceKeys.lists(), removeEmptyParams(filters)] as const,
    details: () => [...attendanceKeys.all, 'detail'] as const,
    detail: (id: string) => [...attendanceKeys.details(), id] as const,
};

export const dashboardKeys = {
    all: ['dashboard'] as const,
    metrics: (params: Record<string, unknown>) => [...dashboardKeys.all, 'metrics', removeEmptyParams(params)] as const,
    lists: () => [...dashboardKeys.all, 'lists'] as const,
    list: (filters: PageableRequest<AttendanceFilters>) => [...dashboardKeys.lists(), removeEmptyParams(filters)] as const,
};

export const historicStartDateKeys = {
    all: ['historic-start-date'] as const,
    historicStartDate: () => [...historicStartDateKeys.all, 'historic-start-date'] as const,
};

export const memberKeys = {
    all: ['members'] as const,
    lists: () => [...memberKeys.all, 'list'] as const,
    list: (filters: PageableRequest<MembersFilters>) => [...memberKeys.lists(), removeEmptyParams(filters)] as const,
    details: () => [...memberKeys.all, 'detail'] as const,
    detail: (id: string) => [...memberKeys.details(), id] as const,
};

export const membershipKeys = {
    all: ['memberships'] as const,
    lists: () => [...membershipKeys.all, 'list'] as const,
    list: (filters: PageableRequest<MembershipsFilters>) => [...membershipKeys.lists(), removeEmptyParams(filters)] as const,
    details: () => [...membershipKeys.all, 'detail'] as const,
    detail: (id: string) => [...membershipKeys.details(), id] as const,
};

export const organizationKeys = {
    all: ['organizations'] as const,
    lists: () => [...organizationKeys.all, 'list'] as const,
    list: (filters: PageableRequest<OrganizationsFilters>) => [...organizationKeys.lists(), removeEmptyParams(filters)] as const,
    details: () => [...organizationKeys.all, 'detail'] as const,
    detail: (id: string) => [...organizationKeys.details(), id] as const,
};

export const planKeys = {
    all: ['plans'] as const,
    lists: () => [...planKeys.all, 'list'] as const,
    list: (filters: PageableRequest<PlansFilters>) => [...planKeys.lists(), removeEmptyParams(filters)] as const,
    details: () => [...planKeys.all, 'detail'] as const,
    detail: (id: string) => [...planKeys.details(), id] as const,
};

export const productKeys = {
    all: ['products'] as const,
    lists: () => [...productKeys.all, 'list'] as const,
    list: (filters: PageableRequest<ProductsFilters>) => [...productKeys.lists(), removeEmptyParams(filters)] as const,
    details: () => [...productKeys.all, 'detail'] as const,
    detail: (id: string) => [...productKeys.details(), id] as const,
};

export const systemKeys = {
    all: ['system'] as const,
    stats: () => [...systemKeys.all, 'stats'] as const,
    organizations: (params: Record<string, unknown>) => [...systemKeys.all, 'organizations', removeEmptyParams(params)] as const,
    recentSignups: () => [...systemKeys.all, 'recent-signups'] as const,
    revenue: () => [...systemKeys.all, 'revenue'] as const,
    config: () => [...systemKeys.all, 'config'] as const,
};

export const userKeys = {
    all: ['users'] as const,
    lists: () => [...userKeys.all, 'list'] as const,
    list: (filters: PageableRequest<UsersFilters>) => [...userKeys.lists(), removeEmptyParams(filters)] as const,
    details: () => [...userKeys.all, 'detail'] as const,
    detail: (id: string) => [...userKeys.details(), id] as const,
};