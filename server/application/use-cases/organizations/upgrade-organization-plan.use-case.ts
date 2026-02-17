import { Organization } from "@/server/domain/entities/Organization";
import { IOrganizationRepository } from "@/server/application/repositories/organizations.repository.interface";

export class UpgradeOrganizationPlanUseCase {
    constructor(
        private readonly repository: IOrganizationRepository
    ) { }

    async execute(input: string): Promise<Organization> {
        return this.repository.upgradePlan(input);
    }
}

export type IUpgradeOrganizationPlanUseCase = InstanceType<typeof UpgradeOrganizationPlanUseCase>