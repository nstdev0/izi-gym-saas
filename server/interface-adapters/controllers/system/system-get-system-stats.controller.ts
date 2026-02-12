import { ISystemGetSystemStatsUseCase } from "@/server/application/use-cases/system/system-get-system-stats.use-case";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { SystemStats } from "@/server/domain/types/system";

export class SystemGetSystemStatsController implements ControllerExecutor<void, SystemStats> {
    constructor(private readonly getSystemStatsUseCase: ISystemGetSystemStatsUseCase) { }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(input: void, id?: string | undefined) {
        return this.getSystemStatsUseCase.execute();
    }
}
