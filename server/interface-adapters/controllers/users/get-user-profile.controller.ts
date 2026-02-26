import { IGetUserByIdUseCase } from "@/server/application/use-cases/users/get-user-by-id.use-case";
import { NotFoundError } from "@/server/domain/errors/common";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { UserResponseMapper } from "../../mappers/user-response.mapper";
import { UserResponse } from "@/shared/types/users.types";
import { UserWithMembership } from "@/server/domain/entities/User";

export class GetUserProfileController implements ControllerExecutor<void, UserResponse> {
  constructor(
    private readonly useCase: IGetUserByIdUseCase,
    private readonly currentUserId: string
  ) { }

  async execute(_input: void): Promise<UserResponse> {
    const user = await this.useCase.execute(this.currentUserId);
    if (!user) {
      throw new NotFoundError("Perfil de usuario no encontrado");
    }
    return UserResponseMapper.toResponse(user as UserWithMembership);
  }
}
