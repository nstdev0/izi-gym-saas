import { IUpdateUserUseCase } from "@/server/application/use-cases/users/update-user.use-case";
import { BadRequestError } from "@/server/domain/errors/common";
import { UpdateUserInput } from "@/server/domain/types/users";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { UserResponse } from "@/shared/types/users.types";
import { UserResponseMapper } from "../../mappers/user-response.mapper";

export class UpdateUserController implements ControllerExecutor<UpdateUserInput, UserResponse> {
  constructor(private readonly useCase: IUpdateUserUseCase) { }

  async execute(input: UpdateUserInput, id?: string): Promise<UserResponse> {
    if (!id) {
      throw new BadRequestError("No se proporcionó el ID del usuario a actualizar");
    }
    const entity = await this.useCase.execute(id, input);
    return UserResponseMapper.toResponse(entity);
  }
}
