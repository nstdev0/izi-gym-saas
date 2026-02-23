import { NotFoundError } from "@/server/domain/errors/common";
import { Organization } from "@/server/domain/entities/Organization";
import { IOrganizationRepository } from "@/server/application/repositories/organizations.repository.interface";
import { IPermissionService } from "@/server/application/services/permission.service.interface";
import { IUnitOfWork } from "@/server/application/services/unit-of-work.interface";

export class UpgradeOrganizationPlanUseCase {
    constructor(
        private readonly organizationRepo: IOrganizationRepository,
        private readonly permissions: IPermissionService,
        private readonly unitOfWork: IUnitOfWork,
        private readonly organizationId: string,
    ) { }

    async execute(planSlug: string): Promise<Organization> {
        this.permissions.require('org:billing');

        // ── Business Validation ────────────────────────────────
        const plan = await this.organizationRepo.findOrganizationPlanBySlug(planSlug);
        if (!plan) throw new NotFoundError(`El plan '${planSlug}' no es válido o no existe.`);

        // ── Delegate Transaction to UoW ────────────────────────
        return this.unitOfWork.upgradeOrganizationPlan({
            organizationId: this.organizationId,
            planId: plan.id,
            planName: plan.name,
            planPrice: plan.price,
        });
    }
}

export type IUpgradeOrganizationPlanUseCase = InstanceType<typeof UpgradeOrganizationPlanUseCase>