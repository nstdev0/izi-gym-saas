import { IUsersRepository } from "@/server/application/repositories/users.repository.interface";
import { User } from "@/server/domain/entities/User";
import { NotFoundError } from "@/server/domain/errors/common";

export interface IRestoreUserUseCase {
    execute(id: string): Promise<User | null>;
}

export class RestoreUserUseCase implements IRestoreUserUseCase {
    constructor(private readonly repo: IUsersRepository) { }

    async execute(id: string): Promise<User | null> {
        const user = await this.repo.findUnique({ id });

        if (!user) throw new NotFoundError("Usuario no encontrado");

        await this.repo.restore(id);

        return await this.repo.findUnique({ id });
    }
}
