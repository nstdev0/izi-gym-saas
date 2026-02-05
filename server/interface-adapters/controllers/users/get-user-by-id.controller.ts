import { IGetUserByIdUseCase } from "@/server/application/use-cases/users/get-user-by-id.use-case";
import { User } from "@/server/domain/entities/User";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class GetUserByIdController implements ControllerExecutor<void, User | null> {
  constructor(private useCase: IGetUserByIdUseCase) { }

  async execute(_input: void, id?: string): Promise<User | null> {
    return this.useCase.execute(id!);
  }
}