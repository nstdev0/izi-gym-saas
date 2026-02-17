import { UpdatePlanInput } from "@/server/domain/types/plans";
import { SystemUpdatePlanUseCase } from "@/server/application/use-cases/system/system-update-plan.use-case";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class SystemUpdatePlanController implements ControllerExecutor<UpdatePlanInput, void> {
    constructor(private readonly useCase: SystemUpdatePlanUseCase) { }

    async execute(data: UpdatePlanInput, id?: string): Promise<void> {
        if (!id) throw new Error("ID is required");
        return this.useCase.execute(id, data);
    }
}
