import { IMembersRepository } from "@/server/application/repositories/members.repository.interface";
import { Member } from "@/server/domain/entities/Member";
import { NotFoundError } from "@/server/domain/errors/common";
import { IPermissionService } from "@/server/application/services/permission.service.interface";

export class RestoreMemberUseCase {
    constructor(
        private readonly membersRepo: IMembersRepository,
        private readonly permissions: IPermissionService
    ) { }

    async execute(id: string): Promise<void> {
        this.permissions.require('members:delete'); // usually restore is part of delete

        const member = await this.membersRepo.findUnique({ id } as any);

        if (!member) {
            throw new NotFoundError("Miembro no encontrado");
        }

        await this.membersRepo.restore(id);
    }
}

export type IRestoreMemberUseCase = InstanceType<typeof RestoreMemberUseCase>