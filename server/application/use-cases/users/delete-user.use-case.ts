import { IUsersRepository } from "@/server/application/repositories/users.repository.interface";
import { User } from "@/server/domain/entities/User";

export interface IDeleteUserUseCase {
  execute(id: string): Promise<User>;
}

export class DeleteUserUseCase implements IDeleteUserUseCase {
  constructor(private readonly repository: IUsersRepository) {}

  async execute(id: string): Promise<User> {
    return this.repository.delete(id);
  }
}
