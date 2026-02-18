import { IUsersRepository } from "@/server/application/repositories/users.repository.interface";
import { User } from "@/server/domain/entities/User";
import { NotFoundError } from "@/server/domain/errors/common";

export interface IRestoreUserUseCase {
    execute(id: string): Promise<User | null>;
}

import { IPermissionService } from "@/server/application/services/permission.service.interface";

export class RestoreUserUseCase implements IRestoreUserUseCase {
    constructor(
        private readonly repo: IUsersRepository,
        private readonly permissions: IPermissionService
    ) { }

    async execute(id: string): Promise<User | null> {
        this.permissions.require('users:delete');
        const user = await this.repo.findUnique({ id });

        if (!user) throw new NotFoundError("Usuario no encontrado");

        await this.repo.restore(id);

        return await this.repo.findUnique({ id });
    }
}
