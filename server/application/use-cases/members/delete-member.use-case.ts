import { IMembersRepository } from "@/server/application/repositories/members.repository.interface";
import { Member } from "@/server/domain/entities/Member";

export interface IDeleteMemberUseCase {
  execute(id: string): Promise<Member>;
}

export class DeleteMemberUseCase implements IDeleteMemberUseCase {
  constructor(private readonly membersRepo: IMembersRepository) {}

  async execute(id: string): Promise<Member> {
    return this.membersRepo.delete(id);
  }
}
