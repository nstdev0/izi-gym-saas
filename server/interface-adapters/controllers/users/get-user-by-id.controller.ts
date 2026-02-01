import { IGetUserByIdUseCase } from "@/server/application/use-cases/users/get-user-by-id.use-case";
import { NotFoundError } from "@/server/domain/errors/common";

export class GetUserByIdController {
  constructor(private readonly useCase: IGetUserByIdUseCase) {}

  async execute(id: string) {
    const user = await this.useCase.execute(id);

    if (!user) {
      throw new NotFoundError("Usuario no encontrado");
    }

    return user;
  }
}
