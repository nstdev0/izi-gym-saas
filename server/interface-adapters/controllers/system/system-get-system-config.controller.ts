import { SystemGetSystemConfigUseCase } from "@/server/application/use-cases/system/system-get-system-config.use-case";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class SystemGetSystemConfigController implements ControllerExecutor<void, any> {
    constructor(private useCase: SystemGetSystemConfigUseCase) { }

    async execute(): Promise<any> {
        return this.useCase.execute();
    }
}
