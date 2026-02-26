import { IGetUserByIdUseCase } from "@/server/application/use-cases/users/get-user-by-id.use-case";
import { BadRequestError, NotFoundError } from "@/server/domain/errors/common";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { UserResponseMapper } from "../../mappers/user-response.mapper";
import { UserResponse } from "@/shared/types/users.types";
import { UserWithMembership } from "@/server/domain/entities/User";

export class GetUserByIdController implements ControllerExecutor<void, UserResponse> {
  constructor(private useCase: IGetUserByIdUseCase) { }

  async execute(_input: void, id?: string): Promise<UserResponse> {
    if (!id) {
      throw new BadRequestError("No se proporcionó un id");
    }
    const user = await this.useCase.execute(id);
    if (!user) {
      throw new NotFoundError("Usuario no encontrado");
    }
    return UserResponseMapper.toResponse(user as UserWithMembership);
  }
}