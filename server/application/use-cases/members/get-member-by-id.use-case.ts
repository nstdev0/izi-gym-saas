import { Member } from "@/server/domain/entities/Member";
import { IMembersRepository } from "../../repositories/members.repository.interface";

export interface IGetMemberByIdUseCase {
  execute(id: string): Promise<Member | null>;
}

export class GetMemberByIdUseCase implements IGetMemberByIdUseCase {
  constructor(private readonly membersRepository: IMembersRepository) { }

  async execute(id: string): Promise<Member | null> {
    return this.membersRepository.findById(id);
  }
}
