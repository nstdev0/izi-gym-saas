import { SystemConfig } from "@/server/domain/types/system";
import { SystemGetSystemConfigUseCase } from "@/server/application/use-cases/system/system-get-system-config.use-case";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class SystemGetSystemConfigController implements ControllerExecutor<void, SystemConfig> {
    constructor(private useCase: SystemGetSystemConfigUseCase) { }

    async execute(): Promise<SystemConfig> {
        return this.useCase.execute();
    }
}
