import { DashboardMetrics } from "@/server/domain/entities/dashboard-metrics";

export interface IDashboardRepository {
    getMetrics(organizationId: string, dateRange: { start: Date; end: Date }): Promise<DashboardMetrics>;
}
