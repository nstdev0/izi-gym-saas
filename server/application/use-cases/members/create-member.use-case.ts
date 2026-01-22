import { ConflictError } from "@/server/domain/errors/common";
import { Member } from "@entities/Member";
import { IMembersRepository } from "@repositories/members.repository.interface";
import { CreateMemberInput } from "../../dtos/create-member.dto";

export class CreateMemberUseCase {
  constructor(private readonly membersRepo: IMembersRepository) {}

  async execute(input: CreateMemberInput): Promise<Member> {
    const errors: string[] = [];

    const verifyEmail = await this.membersRepo.findUnique({
      email: input.email,
    });

    const verifyDocNumber = await this.membersRepo.findUnique({
      docNumber: input.docNumber,
    });

    if (verifyEmail) {
      errors.push("Email");
    }

    if (verifyDocNumber) {
      errors.push("Document number");
    }

    if (errors.length > 2) {
      throw new ConflictError(`${errors.join(", ")} already exists`);
    }

    if (errors.length > 1 && errors.length <= 2) {
      throw new ConflictError(`${errors.join(" and ")} already exists`);
    }

    if (errors.length === 1) {
      throw new ConflictError(`${errors.join(", ")} already exists`);
    }

    const member = await this.membersRepo.create(input);
    return member;
  }
}

export type ICreateMemberUseCase = InstanceType<typeof CreateMemberUseCase>;
