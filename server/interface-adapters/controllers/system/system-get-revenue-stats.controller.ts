import { SystemGetRevenueStatsUseCase } from "@/server/application/use-cases/system/system-get-revenue-stats.use-case";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class SystemGetRevenueStatsController implements ControllerExecutor<void, any> {
    constructor(private useCase: SystemGetRevenueStatsUseCase) { }

    async execute(): Promise<any> {
        return this.useCase.execute();
    }
}
