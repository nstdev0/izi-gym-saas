import { IMembershipsRepository } from "@/server/application/repositories/memberships.repository.interface";
import { CreateMembershipInput } from "@/server/domain/types/memberships";
import { Membership } from "@/server/domain/entities/Membership";
import { ConflictError } from "@/server/domain/errors/common";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class CreateMembershipUseCase implements ControllerExecutor<CreateMembershipInput, Membership> {
  constructor(private repo: IMembershipsRepository) { }

  async execute(input: CreateMembershipInput): Promise<Membership> {
    const existingMembership = await this.repo.findActiveMembershipByMemberId(
      input.memberId
    );

    if (existingMembership) {
      throw new ConflictError("El miembro ya tiene una membresía activa o pendiente");
    }

    return this.repo.create(input);
  }
}

export type ICreateMembershipUseCase = InstanceType<typeof CreateMembershipUseCase>