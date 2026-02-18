import { IUsersRepository } from "@/server/application/repositories/users.repository.interface";

import { IPermissionService } from "@/server/application/services/permission.service.interface";

export class DeleteUserUseCase {
  constructor(
    private readonly repository: IUsersRepository,
    private readonly permissions: IPermissionService
  ) { }

  async execute(id: string): Promise<void> {
    this.permissions.require('users:delete');
    await this.repository.delete(id);
  }
}

export type IDeleteUserUseCase = InstanceType<typeof DeleteUserUseCase>;
