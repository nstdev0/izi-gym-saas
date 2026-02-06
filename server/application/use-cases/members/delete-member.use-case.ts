import { IMembersRepository } from "@/server/application/repositories/members.repository.interface";
import { Member } from "@/server/domain/entities/Member";

export interface IDeleteMemberUseCase {
  execute(id: string): Promise<Member>;
}

import { ConflictError, NotFoundError } from "@/server/domain/errors/common";

export class DeleteMemberUseCase implements IDeleteMemberUseCase {
  constructor(private readonly membersRepo: IMembersRepository) { }

  async execute(id: string): Promise<Member> {
    // 1. Check if member exists and get memberships
    const member = await this.membersRepo.findByIdWithMemberships(id);

    if (!member) {
      throw new NotFoundError("Miembro no encontrado");
    }

    // 2. Validate: Cannot delete if has active or pending memberships
    const hasActiveOrPending = member.memberships?.some(
      (m) => m.status === "ACTIVE" || m.status === "PENDING"
    );

    if (hasActiveOrPending) {
      throw new ConflictError(
        "No se puede eliminar el miembro porque tiene membresías activas o pendientes."
      );
    }

    // 3. Soft Delete (set isActive = false)
    return this.membersRepo.update(id, { isActive: false });
  }
}
