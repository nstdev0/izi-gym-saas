
import { SystemUpdateSystemConfigUseCase } from "@/server/application/use-cases/system/system-update-system-config.use-case";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class SystemUpdateSystemConfigController implements ControllerExecutor<any, void> {
    constructor(private useCase: SystemUpdateSystemConfigUseCase) { }

    async execute(data: any): Promise<void> {
        return this.useCase.execute(data);
    }
}
