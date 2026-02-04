import { Member } from "@/server/domain/entities/Member";
import { IMembersRepository } from "../../repositories/members.repository.interface";
import { CreateMemberInput } from "../../dtos/members.dto";
import { ConflictError } from "@/server/domain/errors/common";
import { IMCCalculator } from "@/server/domain/services/imc-calculator.service";

export class CreateMemberUseCase {
  constructor(private readonly membersRepo: IMembersRepository) { }

  async execute(input: CreateMemberInput): Promise<Member> {
    const errors: string[] = [];

    // Sanitize Email: Convert empty string to null to avoid unique constraint violations
    if (input.email && input.email.trim() === "") {
      input.email = undefined; // Prisma treats undefined as "do not set" or null if nullable
    }

    const validateUnique = await this.membersRepo.validateUnique(input);

    if (validateUnique) errors.push("Email or Document number already exists");

    if (errors.length > 0) {
      const msg = errors.join(" and ");
      throw new ConflictError(`${msg}`);
    }

    if (input.height && input.weight) {
      const imc = IMCCalculator.calculate(input.weight, input.height);
      if (imc) input.imc = imc;
    }

    return await this.membersRepo.create(input);
  }
}

export type ICreateMemberUseCase = InstanceType<typeof CreateMemberUseCase>;
