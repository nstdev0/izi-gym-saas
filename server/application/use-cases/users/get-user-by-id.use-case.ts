import { IUsersRepository } from "@/server/application/repositories/users.repository.interface";
import { User } from "@/server/domain/entities/User";

export interface IGetUserByIdUseCase {
  execute(id: string): Promise<User | null>;
}

export class GetUserByIdUseCase implements IGetUserByIdUseCase {
  constructor(private readonly usersRepository: IUsersRepository) {}

  async execute(id: string): Promise<User | null> {
    return this.usersRepository.findUnique({ id });
  }
}
