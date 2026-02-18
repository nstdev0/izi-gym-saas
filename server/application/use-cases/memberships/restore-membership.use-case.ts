import { IMembershipsRepository } from "../../repositories/memberships.repository.interface";

export interface IRestoreMembershipUseCase {
    execute(id: string): Promise<void>;
}

import { IPermissionService } from "@/server/application/services/permission.service.interface";

export class RestoreMembershipUseCase implements IRestoreMembershipUseCase {
    constructor(
        private readonly repo: IMembershipsRepository,
        private readonly permissions: IPermissionService
    ) { }

    async execute(id: string): Promise<void> {
        this.permissions.require('memberships:delete');
        await this.repo.restore(id);
    }
}