import { IPlansRepository } from "@/server/application/repositories/plans.repository.interface";
import { NotFoundError } from "@/server/domain/errors/common";

import { IPermissionService } from "@/server/application/services/permission.service.interface";

export class RestorePlanUseCase {
    constructor(
        private readonly repo: IPlansRepository,
        private readonly permissions: IPermissionService
    ) { }

    async execute(id: string): Promise<void> {
        this.permissions.require('plans:delete');
        const plan = await this.repo.findUnique({ id });

        if (!plan) throw new NotFoundError("Plan no encontrado");

        await this.repo.restore(id);

        await this.repo.findUnique({ id });
    }
}

export type IRestorePlanUseCase = InstanceType<typeof RestorePlanUseCase>
