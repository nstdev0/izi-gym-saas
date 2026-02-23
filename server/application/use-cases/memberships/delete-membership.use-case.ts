import { IPermissionService } from "@/server/application/services/permission.service.interface";
import { IUnitOfWork } from "@/server/application/services/unit-of-work.interface";

export class DeleteMembershipUseCase {
  constructor(
    private readonly permissions: IPermissionService,
    private readonly unitOfWork: IUnitOfWork,
    private readonly organizationId: string,
  ) { }

  async execute(id: string): Promise<void> {
    this.permissions.require('memberships:delete');
    await this.unitOfWork.deleteMembershipAndDeactivate(id, this.organizationId);
  }
}

export type IDeleteMembershipUseCase = InstanceType<typeof DeleteMembershipUseCase>