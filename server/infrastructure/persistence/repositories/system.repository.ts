import { prisma } from "@/server/infrastructure/persistence/prisma";
import { ISystemRepository } from "@/server/application/repositories/system.repository.interface";
import { SystemStats, RevenueStats, SystemConfig } from "@/server/domain/types/system";
import { Organization } from "@/server/domain/entities/Organization";
import { OrganizationPlan } from "@/server/domain/entities/OrganizationPlan";

import { PageableRequest, PageableResponse } from "@/server/shared/common/pagination";
import { OrganizationsFilters } from "@/server/domain/types/organizations";
import { CreatePlanInput, UpdatePlanInput } from "@/server/domain/types/plans";
import { Prisma } from "@/generated/prisma/client";
import { EntityStatus } from "@/server/domain/entities/_base";

export class SystemRepository implements ISystemRepository {

    async getGlobalStats(): Promise<SystemStats> {
        const [totalUsers, totalOrgs, activeSubsWrapper, allActiveSubs] = await Promise.all([
            prisma.user.count(),
            prisma.organization.count(),
            prisma.subscription.count({
                where: {
                    status: 'ACTIVE'
                }
            }),
            prisma.subscription.findMany({
                where: { status: 'ACTIVE' },
                include: {
                    plan: true
                }
            })
        ]);

        // Calculate MRR from active subscriptions
        const mrr = allActiveSubs.reduce((acc, sub) => {
            // Protección contra nulls y conversión de Decimal
            return acc + Number(sub.plan?.price || 0);
        }, 0);

        return {
            totalUsers,
            totalOrgs,
            activeSubs: activeSubsWrapper,
            mrr
        };
    }

    async getAllOrganizations(request: PageableRequest<OrganizationsFilters>): Promise<PageableResponse<Organization>> {
        const { page = 1, limit = 10, filters } = request;
        const skip = (page - 1) * limit;

        const where: Prisma.OrganizationWhereInput = {};
        let orderBy: Prisma.OrganizationOrderByWithRelationInput = { createdAt: 'desc' };

        if (filters) {
            if (filters.search) {
                const searchTerms = filters.search.trim().split(/\s+/).filter(Boolean);
                if (searchTerms.length > 0) {
                    where.AND = searchTerms.map((term) => ({
                        OR: [
                            { name: { contains: term, mode: "insensitive" } },
                            { slug: { contains: term, mode: "insensitive" } },
                        ],
                    }));
                }
            }

            if (filters.status) {
                if (filters.status.toLowerCase() === 'active') where.isActive = true;
                if (filters.status.toLowerCase() === 'inactive') where.isActive = false;
            }

            if (filters.sort) {
                const parts = filters.sort.split("-");
                if (parts.length === 2) {
                    const [field, direction] = parts;
                    if ((direction === "asc" || direction === "desc")) {
                        if (field === "name") orderBy = { name: direction };
                        if (field === "createdAt") orderBy = { createdAt: direction };
                    }
                }
            }
        }

        const [totalRecords, records] = await Promise.all([
            prisma.organization.count({ where }),
            prisma.organization.findMany({
                skip,
                take: limit,
                where,
                orderBy,
                include: {
                    plan: true,
                    _count: {
                        select: { members: true }
                    }
                }
            })
        ]);

        const totalPages = Math.ceil(totalRecords / limit);

        const mappedRecords = records.map(org => new Organization(
            org.id,
            org.id,
            org.createdAt,
            org.updatedAt,
            org.isActive ? EntityStatus.ACTIVE : EntityStatus.INACTIVE,
            null, // deletedAt
            org.name,
            org.slug,
            org.settings as any,
            org.isActive,
            org.plan ? new OrganizationPlan(
                org.plan.id,
                org.plan.id,
                org.plan.createdAt,
                org.plan.updatedAt,
                EntityStatus.ACTIVE,
                null,
                org.plan.name,
                org.plan.slug,
                Number(org.plan.price),
                org.plan.limits as any
            ) : undefined,
            org.image ? org.image : undefined,
            org._count.members
        ));

        return {
            currentPage: page,
            pageSize: limit,
            totalRecords,
            totalPages,
            hasNext: page < totalPages,
            hasPrevious: page > 1,
            records: mappedRecords
        };
    }

    async suspendOrganization(organizationId: string, suspend: boolean): Promise<void> {
        await prisma.organization.update({
            where: { id: organizationId },
            data: { isActive: !suspend }
        });
    }

    async getRecentSignups(): Promise<Organization[]> {
        const orgs = await prisma.organization.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                subscription: {
                    include: {
                        plan: true
                    }
                },
                _count: {
                    select: { members: true }
                }
            }
        });

        return orgs.map(org => new Organization(
            org.id,
            org.id,
            org.createdAt,
            org.updatedAt,
            org.isActive ? EntityStatus.ACTIVE : EntityStatus.INACTIVE,
            null,
            org.name,
            org.slug,
            org.settings as any,
            org.isActive,
            undefined,
            undefined,
            org._count.members
        ));
    }

    async getRevenueStats(): Promise<RevenueStats[]> {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const subscriptions = await prisma.subscription.findMany({
            where: {
                createdAt: {
                    gte: sixMonthsAgo
                },
                status: 'ACTIVE'
            },
            include: {
                plan: true
            }
        });

        const revenueByMonth: Record<string, number> = {};

        subscriptions.forEach(sub => {
            if (sub.plan) {
                const month = sub.createdAt.toLocaleString('default', { month: 'short' });
                revenueByMonth[month] = (revenueByMonth[month] || 0) + Number(sub.plan.price);
            }
        });

        return Object.entries(revenueByMonth).map(([name, total]) => ({ name, total }));
    }

    async getSystemConfig(): Promise<SystemConfig> {
        let config = await prisma.systemConfig.findFirst();
        if (!config) {
            config = await prisma.systemConfig.create({
                data: {}
            });
        }
        return config;
    }

    async updateSystemConfig(data: Partial<SystemConfig>): Promise<void> {
        const config = await this.getSystemConfig();
        await prisma.systemConfig.update({
            where: { id: config.id },
            data
        });
    }

    async getPlans(): Promise<OrganizationPlan[]> {
        const plans = await prisma.organizationPlan.findMany({
            orderBy: { price: 'asc' }
        });

        return plans.map(p => new OrganizationPlan(
            p.id,
            p.id,
            p.createdAt,
            p.updatedAt,
            EntityStatus.ACTIVE,
            null,
            p.name,
            p.slug,
            Number(p.price),
            p.limits as any
        ));
    }

    async createPlan(data: CreatePlanInput): Promise<void> {
        await prisma.organizationPlan.create({
            data: {
                ...data,
                slug: data.name.toLowerCase().replace(/\s+/g, '-'),
                limits: (data.limits || {}) as any
            }
        });
    }

    async updatePlan(id: string, data: UpdatePlanInput): Promise<void> {
        await prisma.organizationPlan.update({
            where: { id },
            data: {
                ...data,
                limits: (data.limits || {}) as any
            }
        });
    }
}