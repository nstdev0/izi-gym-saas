import { IMembersRepository } from "@/server/application/repositories/members.repository.interface";
import { Member } from "@/server/domain/entities/Member";

export interface IGetMemberByIdUseCase {
  execute(id: string): Promise<Member | null>;
}

export class GetMemberByIdUseCase implements IGetMemberByIdUseCase {
  constructor(private readonly membersRepository: IMembersRepository) {}

  async execute(id: string): Promise<Member | null> {
    return this.membersRepository.findUnique({ id: id });
  }
}
