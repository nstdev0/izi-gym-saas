import { prisma } from "@/server/infrastructure/persistence/prisma";
import { ISystemRepository } from "@/server/application/repositories/system.repository.interface";
import { SystemStats } from "@/server/domain/types/system";
import { Organization } from "@/server/domain/entities/Organization";
import { OrganizationPlan } from "@/server/domain/entities/OrganizationPlan";

import { PageableRequest, PageableResponse } from "@/server/shared/common/pagination";
import { OrganizationsFilters } from "@/server/domain/types/organizations";
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
        // Assuming plan.price is Decimal
        const mrr = allActiveSubs.reduce((acc, sub) => {
            return acc + Number(sub.plan.price || 0);
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
                const [field, direction] = filters.sort.split("-");
                if ((direction === "asc" || direction === "desc")) {
                    if (field === "name") orderBy = { name: direction };
                    if (field === "createdAt") orderBy = { createdAt: direction };
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
            org.id, // self organizationId
            org.createdAt,
            org.updatedAt,
            org.isActive ? EntityStatus.ACTIVE : EntityStatus.INACTIVE, // status
            null, // deletedAt
            org.name,
            org.slug,
            org.settings,
            org.isActive,
            org.plan ? new OrganizationPlan(
                org.plan.id,
                org.plan.id, // using id as orgId for now or just ignore
                org.plan.createdAt,
                org.plan.updatedAt,
                EntityStatus.ACTIVE, // status (defaulting to ACTIVE as plan usually is)
                null, // deletedAt
                org.plan.name,
                org.plan.slug,
                Number(org.plan.price),
                org.plan.limits
            ) : undefined,
            org.image ? org.image : undefined, // image
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
            org.isActive ? EntityStatus.ACTIVE : EntityStatus.INACTIVE, // status
            null, // deletedAt
            org.name,
            org.slug,
            org.settings,
            org.isActive,
            undefined, // plan
            undefined, // image
            org._count.members
        ));
    }

    async getRevenueStats(): Promise<any> {
        // Group by month for the last 6 months
        // Since we don't have a payments table, we'll estimate based on created subscriptions
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

        // Group by month
        const revenueByMonth: Record<string, number> = {};

        subscriptions.forEach(sub => {
            const month = sub.createdAt.toLocaleString('default', { month: 'short' });
            revenueByMonth[month] = (revenueByMonth[month] || 0) + Number(sub.plan.price);
        });

        return Object.entries(revenueByMonth).map(([name, total]) => ({ name, total }));
    }

    async getSystemConfig(): Promise<any> {
        let config = await prisma.systemConfig.findFirst();
        if (!config) {
            config = await prisma.systemConfig.create({
                data: {}
            });
        }
        return config;
    }

    async updateSystemConfig(data: any): Promise<void> {
        const config = await this.getSystemConfig();
        await prisma.systemConfig.update({
            where: { id: config.id },
            data
        });
    }

    async getPlans(): Promise<any[]> {
        return prisma.organizationPlan.findMany({
            orderBy: { price: 'asc' }
        });
    }

    async createPlan(data: any): Promise<void> {
        await prisma.organizationPlan.create({
            data: {
                ...data,
                slug: data.name.toLowerCase().replace(/\s+/g, '-'),
                limits: data.limits || {}
            }
        });
    }

    async updatePlan(id: string, data: any): Promise<void> {
        const { id: _, ...updateData } = data;
        await prisma.organizationPlan.update({
            where: { id },
            data: updateData
        });
    }

}
