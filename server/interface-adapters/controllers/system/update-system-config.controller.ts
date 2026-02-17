
import { SystemConfig } from "@/server/domain/types/system";
import { SystemUpdateSystemConfigUseCase } from "@/server/application/use-cases/system/system-update-system-config.use-case";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class SystemUpdateSystemConfigController implements ControllerExecutor<Partial<SystemConfig>, void> {
    constructor(private readonly useCase: SystemUpdateSystemConfigUseCase) { }

    async execute(data: Partial<SystemConfig>): Promise<void> {
        await this.useCase.execute(data);
    }
}
