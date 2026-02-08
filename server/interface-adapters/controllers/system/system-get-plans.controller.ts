import { SystemGetPlansUseCase } from "@/server/application/use-cases/system/system-get-plans.use-case";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class SystemGetPlansController implements ControllerExecutor<void, any[]> {
    constructor(private useCase: SystemGetPlansUseCase) { }

    async execute(): Promise<any[]> {
        return this.useCase.execute();
    }
}
