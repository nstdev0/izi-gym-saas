import { UpdateMemberInput } from "@/server/domain/types/members";
import { IMembersRepository } from "@/server/application/repositories/members.repository.interface";
import { ConflictError } from "@/server/domain/errors/common";
import { IIMCCalculator } from "@/server/application/services/imc-calculator.interface";
import { Member } from "@/server/domain/entities/Member";

export class UpdateMemberUseCase {
  constructor(
    private readonly repository: IMembersRepository,
    private readonly imcCalculator: IIMCCalculator
  ) { }

  async execute(id: string, data: UpdateMemberInput): Promise<Member> {
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
        const imc = this.imcCalculator.calculate(newWeight, newHeight);
        if (imc) {
          data.imc = imc;
        }
      }
    }

    return await this.repository.update(id, data);
  }
}

export type IUpdateMemberUseCase = InstanceType<typeof UpdateMemberUseCase>;