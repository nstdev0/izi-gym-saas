import { PrismaClient } from "@/generated/prisma/client";
import { IDashboardRepository } from "@/server/application/repositories/dashboard.repository.interface";
import { DashboardMetrics, MetricWithTrend } from "@/server/domain/entities/dashboard-metrics";

export class PrismaDashboardRepository implements IDashboardRepository {
    constructor(private prisma: PrismaClient, private tenantId: string) { }

    async getMetrics(dateRange: { start: Date; end: Date }, grouping?: 'day' | 'month' | 'year'): Promise<DashboardMetrics> {
        const { start, end } = dateRange;
        const duration = end.getTime() - start.getTime();
        const previousStart = new Date(start.getTime() - duration);
        const previousEnd = new Date(end.getTime() - duration);
        const organizationId = this.tenantId;

        // Fetch organization settings to get currency
        const organization = await this.prisma.organization.findUnique({
            where: { id: organizationId },
            select: { config: true }
        });

        // Default to USD if not set
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const config = (organization?.config as any) || {};
        const currency = config.general?.currency || "USD";

        // --- 1. REVENUE (Ingresos) ---
        // Logic: Sum pricePaid of Membership. Filter: organizationId AND createdAt in range.
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

        // --- 2. ACTIVE MEMBERS (Miembros Activos en el periodo) ---
        // Logic: Count Member who had an ACTIVE membership overlapping with the date range.
        // Overlap logic: membership.startDate <= range.end AND membership.endDate >= range.start
        const currentActiveCount = await this.prisma.member.count({
            where: {
                organizationId,
                memberships: {
                    some: {
                        startDate: { lte: end },
                        endDate: { gte: start },
                        status: "ACTIVE", // Optional: depends if we want "Active status" or just "Valid dates". Usually status check is safer.
                    }
                }
            },
        });

        // Trend: Count of New Members (created) in this period vs previous period
        // This remains a valid "Growth" metric to show alongside the total active in period.
        const [newMembersCurrent, newMembersPrevious] = await Promise.all([
            this.prisma.member.count({
                where: { organizationId, createdAt: { gte: start, lte: end } },
            }),
            this.prisma.member.count({
                where: { organizationId, createdAt: { gte: previousStart, lte: previousEnd } },
            }),
        ]);

        const activeMembersMetric: MetricWithTrend = {
            value: currentActiveCount,
            previousValue: 0,
            percentageChange: this.calculatePercentageChange(newMembersCurrent, newMembersPrevious),
        };

        // --- 3. EXPIRING SOON (Vencimientos en el periodo) ---
        // Logic: Count Membership that expire (endDate) within the selected range.
        const expiringSoonCount = await this.prisma.membership.count({
            where: {
                organizationId,
                status: "ACTIVE",
                endDate: {
                    gte: start,
                    lte: end,
                },
            },
        });

        // --- 4. SALES BY PLAN ---
        // Logic: groupBy planId. Filter: createdAt in range. Join to get plan names.
        const salesByPlanGrouped = await this.prisma.membership.groupBy({
            by: ["planId"],
            where: {
                organizationId,
                createdAt: { gte: start, lte: end },
            },
            _count: { id: true },
            _sum: { pricePaid: true },
        });

        const planIds = salesByPlanGrouped.map((p) => p.planId);
        const plans = await this.prisma.plan.findMany({
            where: { id: { in: planIds } },
        });

        const salesByPlan = salesByPlanGrouped.map((group) => {
            const plan = plans.find((p) => p.id === group.planId);
            return {
                planName: plan?.name || "Plan Desconocido",
                count: group._count.id,
                revenue: group._sum.pricePaid ? Number(group._sum.pricePaid) : 0,
            };
        });

        // --- 5. REVENUE OVER TIME ---
        // Logic: Dynamic grouping based on date range duration OR explicit grouping.
        const revenueOverTime = await this.calculateRevenueOverTime(organizationId, start, end, grouping);

        // --- 6. RECENT ACTIVITY ---
        // Keeping existing logic as it wasn't explicitly asked to be changed (other than implicit JSON structure)
        const recentMembers = await this.prisma.member.findMany({
            where: { organizationId },
            orderBy: { createdAt: "desc" },
            take: 5,
            include: {
                memberships: {
                    where: { status: "ACTIVE" },
                    take: 1,
                    orderBy: { createdAt: "desc" },
                    include: { plan: true },
                },
            },
        });

        const recentActivity = recentMembers.map((m) => {
            const activeMembership = m.memberships[0];
            return {
                id: m.id,
                name: `${m.firstName} ${m.lastName}`,
                email: m.email || "",
                avatar: m.image,
                planName: activeMembership?.plan?.name || "Sin Plan",
                joinedAt: m.createdAt,
            };
        });


        // --- 7. UPCOMING EXPIRATIONS ---
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const expiringMemberships = await this.prisma.membership.findMany({
            where: {
                organizationId,
                status: "ACTIVE",
                endDate: {
                    gte: today, // Only future expirations
                },
            },
            orderBy: { endDate: "asc" },
            take: 5,
            include: {
                member: true,
                plan: true,
            },
        });

        const upcomingExpirations = expiringMemberships.map((m) => {
            const endDate = new Date(m.endDate);
            const diffTime = endDate.getTime() - today.getTime();
            const daysUntil = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            return {
                id: m.member.id,
                name: `${m.member.firstName} ${m.member.lastName}`,
                email: m.member.email || "",
                avatar: m.member.image,
                planName: m.plan?.name || "Sin Plan",
                endDate: m.endDate,
                daysUntil,
            };
        });

        return {
            revenue: revenueMetric,
            activeMembers: activeMembersMetric,
            expiringSoon: expiringSoonCount,
            salesByPlan,
            recentActivity,
            upcomingExpirations,
            revenueOverTime,
            currency,
        };
    }

    private async calculateRevenueOverTime(organizationId: string, start: Date, end: Date, grouping?: 'day' | 'month' | 'year') {
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // 1. Determinar agrupación
        const appliedGrouping = grouping || (diffDays <= 31 ? 'day' : 'month');

        // 2. UNA SOLA CONSULTA A BASE DE DATOS (Optimización masiva)
        // Traemos solo fecha y precio de las membresías en el rango
        const memberships = await this.prisma.membership.findMany({
            where: {
                organizationId,
                createdAt: { gte: start, lte: end }
            },
            select: {
                createdAt: true,
                pricePaid: true
            },
            orderBy: { createdAt: 'asc' }
        });

        // 3. Agrupar en memoria (JavaScript es muy rápido para esto)
        const revenueMap = new Map<string, number>();

        // Función auxiliar para generar la clave según agrupación
        const getKey = (date: Date) => {
            if (appliedGrouping === 'day') {
                return date.toISOString().split('T')[0]; // "2026-02-14"
            } else if (appliedGrouping === 'month') {
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`; // "2026-02-01" (Siempre primer día)
            } else {
                return `${date.getFullYear()}-01-01`; // "2026-01-01" (Siempre primer día del año)
            }
        };

        // Llenar el mapa con los datos reales
        memberships.forEach(m => {
            const key = getKey(m.createdAt);
            const amount = Number(m.pricePaid || 0);
            revenueMap.set(key, (revenueMap.get(key) || 0) + amount);
        });

        // 4. Rellenar los huecos (Días/Meses sin ventas deben ser 0)
        const results = [];
        const current = new Date(start);

        // Ajustar current al inicio del periodo según agrupación
        if (appliedGrouping === 'month') current.setDate(1);
        if (appliedGrouping === 'year') { current.setMonth(0); current.setDate(1); }

        while (current <= end) {
            const key = getKey(current);
            // Formatear etiqueta para el eje X (corto) si es necesario, 
            // pero mandamos 'date' completo para el Tooltip
            let label = "";
            if (appliedGrouping === 'day') {
                label = current.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }); // "14 feb"
            } else if (appliedGrouping === 'month') {
                label = current.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }); // "feb 26"
            } else {
                label = current.getFullYear().toString(); // "2026"
            }

            results.push({
                month: key, // Usamos la fecha ISO completa como valor para el gráfico (Recharts lo entiende mejor)
                originalDate: key, // Campo extra por si acaso
                label: label, // La etiqueta visual corta
                revenue: revenueMap.get(key) || 0
            });

            // Avanzar cursor
            if (appliedGrouping === 'day') current.setDate(current.getDate() + 1);
            else if (appliedGrouping === 'month') current.setMonth(current.getMonth() + 1);
            else current.setFullYear(current.getFullYear() + 1);
        }

        return results;
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

    async getHistoricStartDate(): Promise<Date | null> {
        const startDay = await this.prisma.organization.findFirst({
            where: {
                id: this.tenantId
            },
            select: {
                createdAt: true
            }
        });
        return startDay?.createdAt || null;
    }
}
