import { IMembersRepository } from "@/server/application/repositories/members.repository.interface";
import { Member } from "@/server/domain/entities/Member";
import { NotFoundError } from "@/server/domain/errors/common";

export interface IRestoreMemberUseCase {
    execute(id: string): Promise<Member>;
}

export class RestoreMemberUseCase implements IRestoreMemberUseCase {
    constructor(private readonly membersRepo: IMembersRepository) { }

    async execute(id: string): Promise<Member> {
        const member = await this.membersRepo.findByIdWithMemberships(id);

        if (!member) {
            throw new NotFoundError("Miembro no encontrado");
        }

        return this.membersRepo.restore(id);
    }
}
