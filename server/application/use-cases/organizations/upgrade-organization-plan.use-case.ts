import { Organization } from "@/server/domain/entities/Organization";
import { IOrganizationRepository } from "@/server/application/repositories/organizations.repository.interface";

import { IPermissionService } from "@/server/application/services/permission.service.interface";

export class UpgradeOrganizationPlanUseCase {
    constructor(
        private readonly repository: IOrganizationRepository,
        private readonly permissions: IPermissionService
    ) { }

    async execute(input: string): Promise<Organization> {
        this.permissions.require('org:billing');
        return this.repository.upgradePlan(input);
    }
}

export type IUpgradeOrganizationPlanUseCase = InstanceType<typeof UpgradeOrganizationPlanUseCase>