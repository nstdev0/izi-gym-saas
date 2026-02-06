import { PrismaClient } from "@/generated/prisma/client";
import { IDashboardRepository } from "@/server/application/repositories/dashboard.repository.interface";
import { DashboardMetrics, MetricWithTrend } from "@/server/domain/entities/dashboard-metrics";

export class PrismaDashboardRepository implements IDashboardRepository {
    constructor(private prisma: PrismaClient) { }

    async getMetrics(organizationId: string, dateRange: { start: Date; end: Date }): Promise<DashboardMetrics> {
        const { start, end } = dateRange;
        const duration = end.getTime() - start.getTime();
        const previousStart = new Date(start.getTime() - duration);
        const previousEnd = new Date(end.getTime() - duration);

        // --- 1. REVENUE (Ingresos) ---
        const [currentRevenue, previousRevenue] = await Promise.all([
            this.prisma.membership.aggregate({
                _sum: { pricePaid: true },
                where: {
                    organizationId,
                    createdAt: { gte: start, lte: end },
                },
            }),
            this.prisma.membership.aggregate({
                _sum: { pricePaid: true },
                where: {
                    organizationId,
                    createdAt: { gte: previousStart, lte: previousEnd },
                },
            }),
        ]);

        const currentRevenueValue = currentRevenue._sum.pricePaid ? Number(currentRevenue._sum.pricePaid) : 0;
        const previousRevenueValue = previousRevenue._sum.pricePaid ? Number(previousRevenue._sum.pricePaid) : 0;

        const revenueMetric = this.calculateTrend(currentRevenueValue, previousRevenueValue);

        // --- 2. ACTIVE MEMBERS ---
        // Using current count as value, and 0 for trend since we lack historical snapshots
        const currentActiveCount = await this.prisma.member.count({
            where: { organizationId, isActive: true },
        });

        // Growth Momentum: New active members in period vs previous period
        const [newMembersCurrent, newMembersPrevious] = await Promise.all([
            this.prisma.member.count({
                where: { organizationId, createdAt: { gte: start, lte: end }, isActive: true },
            }),
            this.prisma.member.count({
                where: { organizationId, createdAt: { gte: previousStart, lte: previousEnd }, isActive: true },
            }),
        ]);

        const activeMembersMetric: MetricWithTrend = {
            value: currentActiveCount,
            previousValue: 0,
            percentageChange: this.calculatePercentageChange(newMembersCurrent, newMembersPrevious),
        };


        // --- 3. NEW MEMBERSHIPS ---
        const [currentMembershipsCount, previousMembershipsCount] = await Promise.all([
            this.prisma.membership.count({
                where: { organizationId, createdAt: { gte: start, lte: end } },
            }),
            this.prisma.membership.count({
                where: { organizationId, createdAt: { gte: previousStart, lte: previousEnd } },
            }),
        ]);

        const newMembershipsMetric = this.calculateTrend(currentMembershipsCount, previousMembershipsCount);


        // --- 4. RECENT ACTIVITY ---
        const recentMembers = await this.prisma.member.findMany({
            where: { organizationId },
            orderBy: { createdAt: "desc" },
            take: 5,
            include: {
                memberships: {
                    where: { status: "ACTIVE" },
                    take: 1,
                    orderBy: { createdAt: "desc" },
                    include: { plan: true }
                }
            }
        });

        const recentActivity = recentMembers.map(m => {
            const activeMembership = m.memberships[0]; // Can be undefined
            return {
                id: m.id,
                name: `${m.firstName} ${m.lastName}`,
                email: m.email || "",
                avatar: m.image,
                planName: activeMembership?.plan?.name || "Sin Plan",
                joinedAt: m.createdAt,
            };
        });


        // --- 5. MEMBERS BY PLAN ---
        const plansGrouped = await this.prisma.membership.groupBy({
            by: ["planId"],
            where: { organizationId, status: "ACTIVE" },
            _count: { id: true },
            _sum: { pricePaid: true },
        });

        const planIds = plansGrouped.map(p => p.planId);
        const plans = await this.prisma.plan.findMany({
            where: { id: { in: planIds } },
        });

        const membersByPlan = plansGrouped.map(group => {
            const plan = plans.find(p => p.id === group.planId);
            const revenue = group._sum.pricePaid ? Number(group._sum.pricePaid) : 0;

            return {
                planName: plan?.name || "Plan Desconocido",
                count: group._count.id,
                revenue: revenue,
            };
        });

        // --- 6. EXPIRING MEMBERSHIPS ---
        const expiringMembershipsRaw = await this.prisma.membership.findMany({
            where: {
                organizationId,
                status: "ACTIVE",
                endDate: {
                    gte: new Date(),
                    lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                }
            },
            include: {
                member: true,
                plan: true
            },
            orderBy: { endDate: 'asc' },
            take: 5
        });

        const expiringMemberships = expiringMembershipsRaw.map(m => ({
            id: m.id,
            memberName: `${m.member.firstName} ${m.member.lastName}`,
            planName: m.plan.name,
            endDate: m.endDate,
            avatar: m.member.image,
            daysUntilExpiration: Math.ceil((m.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        }));


        return {
            revenue: revenueMetric,
            activeMembers: activeMembersMetric,
            newMemberships: newMembershipsMetric,
            recentActivity,
            membersByPlan,
            expiringMemberships
        };
    }

    private calculateTrend(current: number, previous: number): MetricWithTrend {
        return {
            value: current,
            previousValue: previous,
            percentageChange: this.calculatePercentageChange(current, previous),
        };
    }

    private calculatePercentageChange(current: number, previous: number): number {
        if (previous === 0) {
            return current > 0 ? 100 : 0;
        }
        return ((current - previous) / previous) * 100;
    }
}
