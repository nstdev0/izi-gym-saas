import { IUsersRepository, UsersFilters } from "@/server/application/repositories/users.repository.interface";
import { User } from "@/server/domain/entities/User";
import { PageableRequest, PageableResponse } from "@/shared/common/pagination";

export class GetAllUsersUseCase {
  constructor(private repository: IUsersRepository) { }

  async execute(request: PageableRequest<UsersFilters>): Promise<PageableResponse<User>> {
    return await this.repository.findAll(request);
  }
}

export type IGetAllUsersUseCase = InstanceType<typeof GetAllUsersUseCase>