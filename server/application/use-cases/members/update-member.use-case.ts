import { UpdateMemberInput } from "@/server/domain/types/members";
import { IMembersRepository } from "@/server/application/repositories/members.repository.interface";
import { ConflictError, NotFoundError } from "@/server/domain/errors/common";
import { IIMCCalculator } from "@/server/application/services/imc-calculator.interface";
import { Member } from "@/server/domain/entities/Member";
import { IPermissionService } from "@/server/application/services/permission.service.interface";

export class UpdateMemberUseCase {
  constructor(
    private readonly repository: IMembersRepository,
    private readonly imcCalculator: IIMCCalculator,
    private readonly permissions: IPermissionService
  ) { }

  async execute(id: string, data: UpdateMemberInput): Promise<Member> {
    this.permissions.require('members:update');

    const currentMember = await this.repository.findUnique({ id } as any);

    if (!currentMember) {
      throw new NotFoundError("Miembro no encontrado");
    }

    if (data.email) {
      const existingWithEmail = await this.repository.findUnique({ email: data.email } as any);

      if (existingWithEmail && existingWithEmail.id !== id) {
        throw new ConflictError(`El email registrado ya esta en uso`);
      }
    }

    const newHeight = data.height ?? currentMember.height;
    const newWeight = data.weight ?? currentMember.weight;

    if (newHeight && newWeight) {
      const imc = this.imcCalculator.calculate(newWeight, newHeight);
      if (imc) {
        data.imc = imc;
      }
    }

    return await this.repository.update(id, data);
  }
}

export type IUpdateMemberUseCase = InstanceType<typeof UpdateMemberUseCase>;