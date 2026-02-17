import { Member } from "@/server/domain/entities/Member";
import { IMembersRepository } from "../../repositories/members.repository.interface";
import { CreateMemberInput } from "../../dtos/members.dto";
import { ConflictError } from "@/server/domain/errors/common";
import { IMCCalculator } from "@/server/application/services/imc-calculator.service";
import { generateMemberQrToken } from "@/server/shared/utils/token-generator";

export class CreateMemberUseCase {
  constructor(private readonly repo: IMembersRepository) { }

  async execute(input: CreateMemberInput): Promise<void> {
    const errors: string[] = [];

    const validateUniqueDocument = await this.repo.validateUniqueDocument(input.docType, input.docNumber);

    const validateUniqueEmail = await this.repo.validateUniqueEmail(input.email);

    if (validateUniqueDocument) errors.push("El número de documento ya esta en uso");

    if (validateUniqueEmail) errors.push("El correo electrónico ya esta en uso");

    if (errors.length > 0) {
      const msg = errors.join(" . ");
      throw new ConflictError(`${msg}`);
    }

    if (input.height && input.weight) {
      const imc = IMCCalculator.calculate(input.weight, input.height);
      if (imc) input.imc = imc;
    }

    const qrToken = generateMemberQrToken();
    input.qr = qrToken;

    await this.repo.create(input);
  }
}

export type ICreateMemberUseCase = InstanceType<typeof CreateMemberUseCase>;
