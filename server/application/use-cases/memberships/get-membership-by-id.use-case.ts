import { IMembershipsRepository } from "@/server/application/repositories/memberships.repository.interface";
import { Membership } from "@/server/domain/entities/Membership";

import { IPermissionService } from "@/server/application/services/permission.service.interface";

export class GetMembershipByIdUseCase {
  constructor(
    private readonly repository: IMembershipsRepository,
    private readonly permissions: IPermissionService
  ) { }

  async execute(id: string): Promise<Membership | null> {
    this.permissions.require('memberships:read');
    const membership = await this.repository.findUnique({ id: id });
    if (membership) {
      membership.pricePaid = Number(membership.pricePaid);
    }
    return membership;
  }
}
