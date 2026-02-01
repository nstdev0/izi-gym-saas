import { IUsersRepository } from "@/server/application/repositories/users.repository.interface";
import { UsersFilters } from "@/server/domain/types/users";
import { User } from "@/server/domain/entities/User";
import { PageableResponse } from "@/server/shared/common/pagination";

export interface IGetAllUsersUseCase {
  execute(
    filters: UsersFilters,
    page: number,
    limit: number,
  ): Promise<PageableResponse<User>>;
}

export class GetAllUsersUseCase implements IGetAllUsersUseCase {
  constructor(private repository: IUsersRepository) {}

  async execute(
    filters: UsersFilters,
    page: number = 1,
    limit: number = 10,
  ): Promise<PageableResponse<User>> {
    return this.repository.findAll({ filters, page, limit });
  }
}
