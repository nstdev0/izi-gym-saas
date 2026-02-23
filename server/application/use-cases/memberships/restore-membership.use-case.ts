import { IPermissionService } from "@/server/application/services/permission.service.interface";
import { IUnitOfWork } from "@/server/application/services/unit-of-work.interface";

export interface IRestoreMembershipUseCase {
    execute(id: string): Promise<void>;
}

export class RestoreMembershipUseCase implements IRestoreMembershipUseCase {
    constructor(
        private readonly permissions: IPermissionService,
        private readonly unitOfWork: IUnitOfWork,
        private readonly organizationId: string,
    ) { }

    async execute(id: string): Promise<void> {
        this.permissions.require('memberships:delete');
        // Atomically restore membership + re-activate member if status is ACTIVE
        await this.unitOfWork.restoreMembershipAndActivate(id, this.organizationId);
    }
}