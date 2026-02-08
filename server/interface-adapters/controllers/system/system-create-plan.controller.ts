import { SystemCreatePlanUseCase } from "@/server/application/use-cases/system/system-create-plan.use-case";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class SystemCreatePlanController implements ControllerExecutor<any, void> {
    constructor(private useCase: SystemCreatePlanUseCase) { }

    async execute(data: any): Promise<void> {
        return this.useCase.execute(data);
    }
}
