import { IMembersRepository } from "@/server/application/repositories/members.repository.interface";

import { ConflictError, NotFoundError } from "@/server/domain/errors/common";

export class DeleteMemberUseCase {
  constructor(private readonly membersRepo: IMembersRepository) { }

  async execute(id: string): Promise<void> {
    const member = await this.membersRepo.findByIdWithMemberships(id);

    if (!member) {
      throw new NotFoundError("Miembro no encontrado");
    }

    const hasActiveOrPending = member.memberships?.some(
      (m) => m.status === "ACTIVE" || m.status === "PENDING"
    );

    if (hasActiveOrPending) {
      throw new ConflictError(
        "No se puede eliminar el miembro porque tiene membresías activas o pendientes."
      );
    }

    await this.membersRepo.delete(id);
  }
}

export type IDeleteMemberUseCase = InstanceType<typeof DeleteMemberUseCase>
