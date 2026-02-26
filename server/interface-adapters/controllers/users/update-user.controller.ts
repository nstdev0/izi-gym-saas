import { IUpdateUserUseCase } from "@/server/application/use-cases/users/update-user.use-case";
import { BadRequestError } from "@/server/domain/errors/common";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { UserResponseMapper } from "../../mappers/user-response.mapper";
import { UserResponse, UpdateUserInput } from "@/shared/types/users.types";
import { UserWithMembership } from "@/server/domain/entities/User";

export class UpdateUserController implements ControllerExecutor<UpdateUserInput, UserResponse> {
  constructor(private readonly useCase: IUpdateUserUseCase) { }

  async execute(input: UpdateUserInput, id?: string): Promise<UserResponse> {
    if (!id) {
      throw new BadRequestError("No se proporcionó el ID del usuario a actualizar");
    }
    const result = await this.useCase.execute(id, input);
    return UserResponseMapper.toResponse(result as UserWithMembership);
  }
}
