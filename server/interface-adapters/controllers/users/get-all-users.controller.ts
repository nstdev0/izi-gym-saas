import { UsersFilters } from "@/server/domain/types/users";
import { IGetAllUsersUseCase } from "@/server/application/use-cases/users/get-all-users.use-case";
import { PageableRequest } from "@/shared/common/pagination";
import { UserResponseMapper } from "../../mappers/user-response.mapper";

export class GetAllUsersController {
  constructor(private useCase: IGetAllUsersUseCase) { }

  async execute(request: PageableRequest<UsersFilters>) {
    const result = await this.useCase.execute(request);
    return {
      ...result,
      records: UserResponseMapper.toResponseArray(result.records),
    };
  }
}
