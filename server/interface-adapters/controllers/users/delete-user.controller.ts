import { IDeleteUserUseCase } from "@/server/application/use-cases/users/delete-user.use-case";

export class DeleteUserController {
  constructor(private readonly useCase: IDeleteUserUseCase) {}

  async execute(id: string) {
    return await this.useCase.execute(id);
  }
}
