import { Member } from "@/server/domain/entities/Member";
import { IMembersRepository } from "../../repositories/members.repository.interface";
import { CreateMemberInput } from "../../dtos/create-member.dto";
import { ConflictError } from "@/server/domain/errors/common";

export class CreateMemberUseCase {
  constructor(private readonly membersRepo: IMembersRepository) {}

  async execute(input: CreateMemberInput): Promise<Member> {
    // Validaciones de negocio (Email y DNI únicos)
    const errors: string[] = [];

    const [existingEmail, existingDoc] = await Promise.all([
      this.membersRepo.findUnique({ email: input.email }),
      this.membersRepo.findUnique({ docNumber: input.docNumber }),
    ]);

    if (existingEmail) errors.push("Email");
    if (existingDoc) errors.push("Document number");

    if (errors.length > 0) {
      const msg = errors.join(" and ");
      throw new ConflictError(`${msg} already exists`);
    }

    return await this.membersRepo.create(input);
  }
}

export type ICreateMemberUseCase = InstanceType<typeof CreateMemberUseCase>;
