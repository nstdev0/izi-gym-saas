import { UsersFilters } from "@/server/domain/types/users";
import { IGetAllUsersUseCase } from "@/server/application/use-cases/users/get-all-users.use-case";
import { PageableRequest } from "@/server/shared/common/pagination";

export class GetAllUsersController {
  constructor(private useCase: IGetAllUsersUseCase) {}

  async execute(request: PageableRequest<UsersFilters>) {
    return await this.useCase.execute(
      request.filters || {},
      request.page,
      request.limit,
    );
  }
}
