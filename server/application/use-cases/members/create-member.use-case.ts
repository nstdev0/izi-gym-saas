import { Member } from "@entities/Member";
import { IMembersRepository } from "@repositories/members.repository.interface";

export class CreateMemberUseCase {
  constructor(private readonly membersRepo: IMembersRepository) {}

  async execute(input: Record<string, unknown>): Promise<Member> {
    const member = await this.membersRepo.create(input);
    return member;
  }
}

export type ICreateMemberUseCase = InstanceType<typeof CreateMemberUseCase>;
