import { IMembershipsRepository } from "@/server/application/repositories/memberships.repository.interface";
import { UpdateMembershipInput } from "@/server/domain/types/memberships";
import { Membership } from "@/server/domain/entities/Membership";

import { IPermissionService } from "@/server/application/services/permission.service.interface";

export class UpdateMembershipUseCase {
  constructor(
    private readonly repository: IMembershipsRepository,
    private readonly permissions: IPermissionService
  ) { }

  async execute(id: string, data: UpdateMembershipInput): Promise<Membership> {
    this.permissions.require('memberships:update');
    return await this.repository.update(id, data);
  }
}
