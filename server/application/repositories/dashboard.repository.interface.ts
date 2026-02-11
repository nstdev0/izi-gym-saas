import { DashboardMetrics } from "@/server/domain/entities/dashboard-metrics";

export interface IDashboardRepository {
    getMetrics(dateRange: { start: Date; end: Date }, grouping?: 'day' | 'month' | 'year'): Promise<DashboardMetrics>;
    getHistoricStartDate(): Promise<Date | null>;
}
