import { SystemUpdatePlanUseCase } from "@/server/application/use-cases/system/system-update-plan.use-case";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class SystemUpdatePlanController implements ControllerExecutor<any, void> {
    constructor(private useCase: SystemUpdatePlanUseCase) { }

    async execute(data: any, id?: string): Promise<void> {
        if (!id) throw new Error("ID is required");
        return this.useCase.execute(id, data);
    }
}
