import { IUpgradeOrganizationPlanUseCase } from "@/server/application/use-cases/organizations/upgrade-organization-plan.use-case";
import { BadRequestError } from "@/server/domain/errors/common";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class UpgradeOrganizationPlanController implements ControllerExecutor<Record<string, string>, void> {
    constructor(private readonly useCase: IUpgradeOrganizationPlanUseCase) { }

    async execute(input: Record<string, string>, _id?: string): Promise<void> {
        if (!input.plan) {
            throw new BadRequestError("Plan no especificado")
        }
        await this.useCase.execute(input.plan);
    }
}