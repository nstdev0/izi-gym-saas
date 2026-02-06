import { IDashboardRepository } from "@/server/application/repositories/dashboard.repository.interface";
import { DashboardMetrics } from "@/server/domain/entities/dashboard-metrics";

export class GetDashboardMetricsUseCase {
    constructor(private dashboardRepository: IDashboardRepository) { }

    async execute(organizationId: string, from?: Date, to?: Date): Promise<DashboardMetrics> {
        // Default to current month if no dates provided
        const now = new Date();
        const start = from || new Date(now.getFullYear(), now.getMonth(), 1);
        const end = to || new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        return this.dashboardRepository.getMetrics(organizationId, { start, end });
    }
}
