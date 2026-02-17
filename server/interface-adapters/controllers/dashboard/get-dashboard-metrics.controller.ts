import { GetDashboardMetricsUseCase } from "@/server/application/use-cases/dashboard/get-dashboard-metrics.use-case";
import { GetDashboardMetricsInput } from "@/server/domain/types/dashboard";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { DashboardMetrics } from "@/shared/types/dashboard.types";

export class GetDashboardMetricsController implements ControllerExecutor<GetDashboardMetricsInput, DashboardMetrics> {
    constructor(private getDashboardMetricsUseCase: GetDashboardMetricsUseCase) { }

    async execute(input: GetDashboardMetricsInput) {
        return await this.getDashboardMetricsUseCase.execute(
            input.from,
            input.to,
            input.grouping
        );
    }
}
