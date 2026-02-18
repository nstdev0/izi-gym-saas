import { IUsersRepository } from "@/server/application/repositories/users.repository.interface";
import { User } from "@/server/domain/entities/User";

export interface IGetUserByIdUseCase {
  execute(id: string): Promise<User | null>;
}

import { IPermissionService } from "@/server/application/services/permission.service.interface";

export class GetUserByIdUseCase implements IGetUserByIdUseCase {
  constructor(
    private readonly usersRepository: IUsersRepository,
    private readonly permissions: IPermissionService
  ) { }

  async execute(id: string): Promise<User | null> {
    this.permissions.require('users:read');
    return this.usersRepository.findUnique({ id });
  }
}
