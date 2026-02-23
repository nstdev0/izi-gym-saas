import { IPermissionService } from "@/server/application/services/permission.service.interface";
import { IUnitOfWork } from "@/server/application/services/unit-of-work.interface";

export class CancelMembershipUseCase {
    constructor(
        private readonly permissions: IPermissionService,
        private readonly unitOfWork: IUnitOfWork,
        private readonly organizationId: string,
    ) { }

    async execute(id: string): Promise<void> {
        this.permissions.require('memberships:update');
        await this.unitOfWork.cancelMembershipAndDeactivate(id, this.organizationId);
    }
}

export type ICancelMembershipUseCase = InstanceType<typeof CancelMembershipUseCase>