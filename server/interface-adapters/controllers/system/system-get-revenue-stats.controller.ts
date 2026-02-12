import { RevenueStats } from "@/server/domain/types/system";
import { SystemGetRevenueStatsUseCase } from "@/server/application/use-cases/system/system-get-revenue-stats.use-case";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class SystemGetRevenueStatsController implements ControllerExecutor<void, RevenueStats[]> {
    constructor(private useCase: SystemGetRevenueStatsUseCase) { }

    async execute(): Promise<RevenueStats[]> {
        return this.useCase.execute();
    }
}
