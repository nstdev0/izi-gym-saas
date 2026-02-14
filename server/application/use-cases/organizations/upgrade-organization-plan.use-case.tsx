import { Organization } from "@/server/domain/entities/Organization";
import { IOrganizationRepository } from "../../repositories/organizations.repository.interface";

export class UpgradeOrganizationPlanUseCase {
    constructor(
        private readonly organizationRepository: IOrganizationRepository,
    ) { }

    async execute(input: string): Promise<Organization> {
        return this.organizationRepository.upgradePlan(input);
    }
}

export type IUpgradeOrganizationPlanUseCase = InstanceType<typeof UpgradeOrganizationPlanUseCase>