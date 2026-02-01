import { UpdateUserInput } from "@/server/domain/types/users";
import { IUsersRepository } from "@/server/application/repositories/users.repository.interface";
import { User } from "@/server/domain/entities/User";

export interface IUpdateUserUseCase {
  execute(id: string, data: UpdateUserInput): Promise<User>;
}

export class UpdateUserUseCase implements IUpdateUserUseCase {
  constructor(private readonly usersRepository: IUsersRepository) {}

  async execute(id: string, data: UpdateUserInput): Promise<User> {
    return this.usersRepository.update(id, data);
  }
}
