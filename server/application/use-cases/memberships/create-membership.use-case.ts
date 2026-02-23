import { IMembershipsRepository } from "@/server/application/repositories/memberships.repository.interface";
import { CreateMembershipInput } from "@/server/domain/types/memberships";
import { ConflictError } from "@/server/domain/errors/common";
import { Membership } from "@/server/domain/entities/Membership";
import { IPermissionService } from "@/server/application/services/permission.service.interface";
import { IUnitOfWork } from "@/server/application/services/unit-of-work.interface";

export class CreateMembershipUseCase {
  constructor(
    private readonly membershipsRepo: IMembershipsRepository,
    private readonly permissions: IPermissionService,
    private readonly unitOfWork: IUnitOfWork,
    private readonly organizationId: string,
  ) { }

  async execute(input: CreateMembershipInput): Promise<Membership> {
    this.permissions.require('memberships:create');

    // ── Business Validation ────────────────────────────────
    const existingMembership = await this.membershipsRepo.findActiveMembershipByMemberId(
      input.memberId
    );

    if (existingMembership) {
      throw new ConflictError("El miembro ya tiene una membresía activa o pendiente");
    }

    // ── Delegate Transaction to UoW (create membership + activate member) ─
    return await this.unitOfWork.createMembershipAndActivate({
      membershipData: input,
      organizationId: this.organizationId,
    });
  }
}

export type ICreateMembershipUseCase = InstanceType<typeof CreateMembershipUseCase>