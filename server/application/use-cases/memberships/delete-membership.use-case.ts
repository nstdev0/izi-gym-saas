import { IMembershipsRepository } from "@/server/application/repositories/memberships.repository.interface";

import { IPermissionService } from "@/server/application/services/permission.service.interface";

export class DeleteMembershipUseCase {
  constructor(
    private readonly repository: IMembershipsRepository,
    private readonly permissions: IPermissionService
  ) { }

  async execute(id: string): Promise<void> {
    this.permissions.require('memberships:delete');
    await this.repository.delete(id);
  }
}

export type IDeleteMembershipUseCase = InstanceType<typeof DeleteMembershipUseCase>