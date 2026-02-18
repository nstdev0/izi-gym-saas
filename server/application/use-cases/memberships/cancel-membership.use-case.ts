import { IMembershipsRepository } from "../../repositories/memberships.repository.interface";

import { IPermissionService } from "@/server/application/services/permission.service.interface";

export class CancelMembershipUseCase {
    constructor(
        private readonly repo: IMembershipsRepository,
        private readonly permissions: IPermissionService
    ) { }

    async execute(id: string): Promise<void> {
        this.permissions.require('memberships:update');
        await this.repo.cancel(id);
    }
}

export type ICancelMembershipUseCase = InstanceType<typeof CancelMembershipUseCase>