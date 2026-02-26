import { prisma } from "@/server/infrastructure/persistence/prisma";
import { ISystemRepository } from "@/server/application/repositories/system.repository.interface";
import { SystemStats, RevenueStats, SystemConfig } from "@/server/domain/types/system";
import { Organization } from "@/server/domain/entities/Organization";
import { OrganizationPlan } from "@/server/domain/entities/OrganizationPlan";

import { PageableRequest, PageableResponse } from "@/shared/types/pagination.types";
import { OrganizationsFilters } from "@/server/domain/types/organizations";
import { CreatePlanInput, UpdatePlanInput } from "@/server/domain/types/plans";
import { Prisma } from "@/generated/prisma/client";
import { OrganizationMapper } from "../mappers/organizations.mapper";
import { OrganizationPlanMapper } from "../mappers/organization-plans.mapper";
import { translatePrismaError } from "../prisma-error-translator";

export class SystemRepository implements ISystemRepository {
    private mapper = new OrganizationMapper();
    private planMapper = new OrganizationPlanMapper();

    async getGlobalStats(): Promise<SystemStats> {
        try {
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
                return acc + Number(sub.pricePaid || 0);
            }, 0);

            return {
                totalUsers,
                totalOrgs,
                activeSubs: activeSubsWrapper,
                mrr
            };
        } catch (error) {
            translatePrismaError(error, "Sistema")
        }
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

        try {
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

            const mappedRecords = records.map(org => this.mapper.toDomain(org));

            return {
                currentPage: page,
                pageSize: limit,
                totalRecords,
                totalPages,
                hasNext: page < totalPages,
                hasPrevious: page > 1,
                records: mappedRecords
            };
        } catch (error) {
            translatePrismaError(error, "Sistema")
        }
    }

    async suspendOrganization(organizationId: string, suspend: boolean): Promise<void> {
        try {
            await prisma.organization.update({
                where: { id: organizationId },
                data: { isActive: !suspend }
            });
        } catch (error) {
            translatePrismaError(error, "Sistema")
        }
    }

    async getRecentSignups(): Promise<Organization[]> {
        try {
            const orgs = await prisma.organization.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    plan: true,
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

            return orgs.map(org => this.mapper.toDomain(org));
        } catch (error) {
            translatePrismaError(error, "Sistema")
        }
    }

    async getRevenueStats(): Promise<RevenueStats[]> {
        try {
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
        } catch (error) {
            translatePrismaError(error, "Sistema")
        }
    }

    async getSystemConfig(): Promise<SystemConfig> {
        try {
            let config = await prisma.systemConfig.findFirst();
            if (!config) {
                config = await prisma.systemConfig.create({
                    data: {}
                });
            }
            return config as SystemConfig;
        } catch (error) {
            translatePrismaError(error, "Sistema")
        }
    }

    async updateSystemConfig(data: Partial<SystemConfig>): Promise<void> {
        try {
            const config = await this.getSystemConfig();
            await prisma.systemConfig.update({
                where: { id: config.id },
                data
            });
        } catch (error) {
            translatePrismaError(error, "Sistema")
        }
    }

    async getPlans(): Promise<OrganizationPlan[]> {
        try {
            const plans = await prisma.organizationPlan.findMany({
                orderBy: { price: 'asc' }
            });

            return plans.map(p => this.planMapper.toDomain(p));
        } catch (error) {
            translatePrismaError(error, "Sistema")
        }
    }

    async getPlanBySlug(slug: string): Promise<OrganizationPlan | null> {
        try {
            const plan = await prisma.organizationPlan.findUnique({
                where: { slug }
            });
            if (!plan) return null;
            return this.planMapper.toDomain(plan);
        } catch (error) {
            translatePrismaError(error, "Sistema");
            return null;
        }
    }

    async createPlan(data: CreatePlanInput): Promise<void> {
        try {
            await prisma.organizationPlan.create({
                data: {
                    ...data,
                    slug: data.name.toLowerCase().replace(/\s+/g, '-'),
                    limits: (data.limits || {}) as any
                }
            });
        } catch (error) {
            translatePrismaError(error, "Sistema")
        }
    }

    async updatePlan(id: string, data: UpdatePlanInput): Promise<void> {
        try {
            await prisma.organizationPlan.update({
                where: { id },
                data: {
                    ...data,
                    limits: (data.limits || {}) as any
                }
            });
        } catch (error) {
            translatePrismaError(error, "Sistema")
        }
    }
}