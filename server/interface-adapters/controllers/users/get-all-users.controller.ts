import { UsersFilters } from "@/server/domain/types/users";
import { IGetAllUsersUseCase } from "@/server/application/use-cases/users/get-all-users.use-case";
import { UserResponseMapper } from "../../mappers/user-response.mapper";
import { PageableRequest, PageableResponse } from "@/shared/types/pagination.types";
import { UserWithMembership } from "@/server/domain/entities/User";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { UserResponse } from "@/shared/types/users.types";

export class GetAllUsersController implements ControllerExecutor<PageableRequest<UsersFilters>, PageableResponse<UserResponse>> {
  constructor(private useCase: IGetAllUsersUseCase) { }

  async execute(request: PageableRequest<UsersFilters>): Promise<PageableResponse<UserResponse>> {
    const result = await this.useCase.execute(request);
    return {
      ...result,
      records: UserResponseMapper.toResponseArray(result.records as UserWithMembership[]),
    };
  }
}
