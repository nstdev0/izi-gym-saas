import { CreatePlanInput } from "@/server/domain/types/plans";
import { SystemCreatePlanUseCase } from "@/server/application/use-cases/system/system-create-plan.use-case";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class SystemCreatePlanController implements ControllerExecutor<CreatePlanInput, void> {
    constructor(private readonly useCase: SystemCreatePlanUseCase) { }

    async execute(data: CreatePlanInput): Promise<void> {
        await this.useCase.execute(data);
    }
}
