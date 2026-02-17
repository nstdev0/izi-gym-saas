import { IMembershipsRepository } from "@/server/application/repositories/memberships.repository.interface";
import { CreateMembershipInput } from "@/server/domain/types/memberships";
import { ConflictError } from "@/server/domain/errors/common";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class CreateMembershipUseCase implements ControllerExecutor<CreateMembershipInput, void> {
  constructor(private repo: IMembershipsRepository) { }

  async execute(input: CreateMembershipInput): Promise<void> {
    const existingMembership = await this.repo.findActiveMembershipByMemberId(
      input.memberId
    );

    if (existingMembership) {
      throw new ConflictError("El miembro ya tiene una membresía activa o pendiente");
    }

    await this.repo.create(input);
  }
}

export type ICreateMembershipUseCase = InstanceType<typeof CreateMembershipUseCase>