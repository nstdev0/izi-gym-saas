import { UpdateUserInput } from "@/server/domain/types/users";
import { IUsersRepository } from "@/server/application/repositories/users.repository.interface";

export class UpdateUserUseCase {
  constructor(private readonly usersRepository: IUsersRepository) { }

  async execute(id: string, data: UpdateUserInput): Promise<void> {
    await this.usersRepository.update(id, data);
  }
}

export type IUpdateUserUseCase = InstanceType<typeof UpdateUserUseCase>;