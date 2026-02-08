import { removeEmptyParams } from "@/lib/utils";

export const memberKeys = {
    all: ['members'] as const,
    lists: () => [...memberKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...memberKeys.lists(), removeEmptyParams(filters)] as const,
    details: () => [...memberKeys.all, 'detail'] as const,
    detail: (id: string) => [...memberKeys.details(), id] as const,
};

export const membershipKeys = {
    all: ['memberships'] as const,
    lists: () => [...membershipKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...membershipKeys.lists(), removeEmptyParams(filters)] as const,
    details: () => [...membershipKeys.all, 'detail'] as const,
    detail: (id: string) => [...membershipKeys.details(), id] as const,
};

export const planKeys = {
    all: ['plans'] as const,
    lists: () => [...planKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...planKeys.lists(), removeEmptyParams(filters)] as const,
    details: () => [...planKeys.all, 'detail'] as const,
    detail: (id: string) => [...planKeys.details(), id] as const,
};

export const userKeys = {
    all: ['users'] as const,
    lists: () => [...userKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...userKeys.lists(), removeEmptyParams(filters)] as const,
    details: () => [...userKeys.all, 'detail'] as const,
    detail: (id: string) => [...userKeys.details(), id] as const,
};

export const productKeys = {
    all: ['products'] as const,
    lists: () => [...productKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...productKeys.lists(), removeEmptyParams(filters)] as const,
    details: () => [...productKeys.all, 'detail'] as const,
    detail: (id: string) => [...productKeys.details(), id] as const,
};

export const organizationKeys = {
    all: ['organizations'] as const,
    lists: () => [...organizationKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...organizationKeys.lists(), removeEmptyParams(filters)] as const,
    details: () => [...organizationKeys.all, 'detail'] as const,
    detail: (id: string) => [...organizationKeys.details(), id] as const,
};

export const dashboardKeys = {
    all: ['dashboard'] as const,
    metrics: (params: Record<string, unknown>) => [...dashboardKeys.all, 'metrics', removeEmptyParams(params)] as const,
};

export const systemKeys = {
    all: ['system'] as const,
    stats: () => [...systemKeys.all, 'stats'] as const,
    organizations: (params: Record<string, unknown>) => [...systemKeys.all, 'organizations', removeEmptyParams(params)] as const,
    recentSignups: () => [...systemKeys.all, 'recent-signups'] as const,
    revenue: () => [...systemKeys.all, 'revenue'] as const,
    config: () => [...systemKeys.all, 'config'] as const,
};
