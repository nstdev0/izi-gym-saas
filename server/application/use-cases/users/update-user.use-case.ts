import { UpdateUserInput } from "@/server/domain/types/users";
import { IUsersRepository } from "@/server/application/repositories/users.repository.interface";
import { User } from "@/server/domain/entities/User";
import { ForbiddenError } from "@/server/domain/errors/common";
import { Role } from "@/shared/types/users.types";

const ALLOWED_ROLES: Role[] = [Role.GOD, Role.OWNER];

export class UpdateUserUseCase {
  constructor(
    private readonly usersRepository: IUsersRepository,
    private readonly currentUserId: string,
  ) { }

  async execute(id: string, data: UpdateUserInput): Promise<User> {
    const currentUser = await this.usersRepository.findById(this.currentUserId);

    if (!currentUser || !ALLOWED_ROLES.includes(currentUser.role as Role)) {
      throw new ForbiddenError("No tienes permisos para actualizar usuarios");
    }

    return await this.usersRepository.update(id, data);
  }
}

export type IUpdateUserUseCase = InstanceType<typeof UpdateUserUseCase>;