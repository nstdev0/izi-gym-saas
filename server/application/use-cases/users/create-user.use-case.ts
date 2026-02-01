import { IUsersRepository } from "@/server/application/repositories/users.repository.interface";
import { CreateUserInput } from "@/server/domain/types/users";
import { User } from "@/server/domain/entities/User";

export interface ICreateUserUseCase {
  execute(input: CreateUserInput): Promise<User>;
}

export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(private repository: IUsersRepository) {}

  async execute(input: CreateUserInput): Promise<User> {
    return this.repository.create(input);
  }
}
