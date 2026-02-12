import { OrganizationPlan } from "@/server/domain/entities/OrganizationPlan";
import { SystemGetPlansUseCase } from "@/server/application/use-cases/system/system-get-plans.use-case";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class SystemGetPlansController implements ControllerExecutor<void, OrganizationPlan[]> {
    constructor(private useCase: SystemGetPlansUseCase) { }

    async execute(): Promise<OrganizationPlan[]> {
        return this.useCase.execute();
    }
}
