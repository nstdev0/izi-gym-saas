import { UpdateMemberInput } from "@/server/domain/types/members";
import { IMembersRepository } from "@/server/application/repositories/members.repository.interface";
import { Member } from "@/server/domain/entities/Member";
import { IMCCalculator } from "@/server/domain/services/imc-calculator.service";

export interface IUpdateMemberUseCase {
  execute(id: string, data: UpdateMemberInput): Promise<Member>;
}

export class UpdateMemberUseCase implements IUpdateMemberUseCase {
  constructor(private readonly membersRepository: IMembersRepository) {}

  async execute(id: string, data: UpdateMemberInput): Promise<Member> {
    // 1. Fetch current member to get missing height/weight if needed
    const currentMember = await this.membersRepository.findUnique({ id });

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

    return this.membersRepository.update(id, data);
  }
}
