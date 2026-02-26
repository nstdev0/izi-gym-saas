import { IUsersRepository, UsersFilters } from "@/server/application/repositories/users.repository.interface";
import { User } from "@/server/domain/entities/User";
import { PageableRequest, PageableResponse } from "@/shared/types/pagination.types";

import { IPermissionService } from "@/server/application/services/permission.service.interface";

export class GetAllUsersUseCase {
  constructor(
    private repository: IUsersRepository,
    private readonly permissions: IPermissionService
  ) { }

  async execute(request: PageableRequest<UsersFilters>): Promise<PageableResponse<User>> {
    this.permissions.require('users:read');
    return await this.repository.findAll(request);
  }
}

export type IGetAllUsersUseCase = InstanceType<typeof GetAllUsersUseCase>