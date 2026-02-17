import { IMembersRepository } from "@/server/application/repositories/members.repository.interface";
import { Member } from "@/server/domain/entities/Member";
import { NotFoundError } from "@/server/domain/errors/common";

export class RestoreMemberUseCase {
    constructor(private readonly membersRepo: IMembersRepository) { }

    async execute(id: string): Promise<void> {
        const member = await this.membersRepo.findByIdWithMemberships(id);

        if (!member) {
            throw new NotFoundError("Miembro no encontrado");
        }

        await this.membersRepo.restore(id);
    }
}

export type IRestoreMemberUseCase = InstanceType<typeof RestoreMemberUseCase>