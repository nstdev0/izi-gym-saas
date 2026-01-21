import { Member } from "@entities/Member";
import { IMembersRepository } from "@repositories/members.repository.interface";

export class GetAllMembersUseCase {
  constructor(private readonly membersRepo: IMembersRepository) {}

  async execute(): Promise<Member[]> {
    return await this.membersRepo.findAll();
  }
}

export type IGetAllMembersUseCase = InstanceType<typeof GetAllMembersUseCase>;
