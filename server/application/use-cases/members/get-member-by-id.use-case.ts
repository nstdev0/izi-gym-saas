import { Member } from "@/server/domain/entities/Member";
import { IMembersRepository } from "../../repositories/members.repository.interface";
import { IPermissionService } from "@/server/application/services/permission.service.interface";
import { NotFoundError } from "@/server/domain/errors/common";

export interface IGetMemberByIdUseCase {
  execute(id: string): Promise<Member | null>;
}

export class GetMemberByIdUseCase implements IGetMemberByIdUseCase {
  constructor(
    private readonly membersRepository: IMembersRepository,
    private readonly permissions: IPermissionService
  ) { }

  async execute(id: string): Promise<Member | null> {
    this.permissions.require('members:read');
    const member = await this.membersRepository.findUnique({ id } as any);

    if (!member) {
      throw new NotFoundError("Miembro no encontrado");
    }

    return member;
  }
}
