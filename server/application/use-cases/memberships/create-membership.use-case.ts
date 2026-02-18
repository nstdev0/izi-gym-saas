import { IMembershipsRepository } from "@/server/application/repositories/memberships.repository.interface";
import { CreateMembershipInput } from "@/server/domain/types/memberships";
import { ConflictError } from "@/server/domain/errors/common";
import { Membership } from "@/server/domain/entities/Membership";

import { IPermissionService } from "@/server/application/services/permission.service.interface";

export class CreateMembershipUseCase {
  constructor(
    private repo: IMembershipsRepository,
    private readonly permissions: IPermissionService
  ) { }

  async execute(input: CreateMembershipInput): Promise<Membership> {
    this.permissions.require('memberships:create');
    const existingMembership = await this.repo.findActiveMembershipByMemberId(
      input.memberId
    );

    if (existingMembership) {
      throw new ConflictError("El miembro ya tiene una membresía activa o pendiente");
    }

    return await this.repo.create(input);
  }
}

export type ICreateMembershipUseCase = InstanceType<typeof CreateMembershipUseCase>