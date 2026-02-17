import { IUsersRepository } from "@/server/application/repositories/users.repository.interface";

export class DeleteUserUseCase {
  constructor(private readonly repository: IUsersRepository) { }

  async execute(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}

export type IDeleteUserUseCase = InstanceType<typeof DeleteUserUseCase>;
