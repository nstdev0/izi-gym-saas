import { UpdateMemberInput } from "@/server/domain/types/members";
import { IMembersRepository } from "@/server/application/repositories/members.repository.interface";
import { IMCCalculator } from "@/server/application/services/imc-calculator.service";
import { ConflictError } from "@/server/domain/errors/common";

export class UpdateMemberUseCase {
  constructor(private readonly repository: IMembersRepository) { }

  async execute(id: string, data: UpdateMemberInput): Promise<void> {
    if (data.email) {
      const existingWithEmail = await this.repository.validateUniqueEmail(data.email);

      if (existingWithEmail && existingWithEmail.id !== id) {
        throw new ConflictError(`El email registrado ya esta en uso`);
      }
    }

    const currentMember = await this.repository.findUnique({ id });

    if (currentMember) {
      const newHeight = data.height ?? currentMember.height;
      const newWeight = data.weight ?? currentMember.weight;

      if (newHeight && newWeight) {
        const imc = IMCCalculator.calculate(newWeight, newHeight);
        if (imc) {
          data.imc = imc;
        }
      }
    }

    await this.repository.update(id, data);
  }
}

export type IUpdateMemberUseCase = InstanceType<typeof UpdateMemberUseCase>;