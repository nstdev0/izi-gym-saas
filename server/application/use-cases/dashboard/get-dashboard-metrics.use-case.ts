import { IDashboardRepository } from "@/server/application/repositories/dashboard.repository.interface";
import { DashboardMetrics } from "@/server/domain/entities/dashboard-metrics";
import { IPermissionService } from "@/server/application/services/permission.service.interface";

export class GetDashboardMetricsUseCase {
    constructor(
        private repo: IDashboardRepository,
        private readonly permissions: IPermissionService
    ) { }

    async execute(from?: Date, to?: Date, grouping?: 'day' | 'month' | 'year'): Promise<DashboardMetrics> {
        this.permissions.require('dashboard:read');
        const now = new Date();
        const start = from || new Date(now.getFullYear(), now.getMonth(), 1);
        const end = to || new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        return this.repo.getMetrics({ start, end }, grouping);
    }
}
