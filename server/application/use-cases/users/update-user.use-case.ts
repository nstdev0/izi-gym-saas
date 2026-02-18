import { UpdateUserInput } from "@/server/domain/types/users";
import { IUsersRepository } from "@/server/application/repositories/users.repository.interface";
import { User } from "@/server/domain/entities/User";
import { ForbiddenError } from "@/server/domain/errors/common";
import { Role } from "@/shared/types/users.types";

import { IPermissionService } from "@/server/application/services/permission.service.interface";

export class UpdateUserUseCase {
  constructor(
    private readonly usersRepository: IUsersRepository,
    private readonly currentUserId: string,
    private readonly permissions: IPermissionService,
  ) { }

  async execute(id: string, data: UpdateUserInput): Promise<User> {
    this.permissions.require('users:update');
    return await this.usersRepository.update(id, data);
  }
}

export type IUpdateUserUseCase = InstanceType<typeof UpdateUserUseCase>;