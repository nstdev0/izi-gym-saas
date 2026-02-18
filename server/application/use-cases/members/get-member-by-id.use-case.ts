import { Member } from "@/server/domain/entities/Member";
import { IMembersRepository } from "../../repositories/members.repository.interface";

export interface IGetMemberByIdUseCase {
  execute(id: string): Promise<Member | null>;
}

import { IPermissionService } from "@/server/application/services/permission.service.interface";

export class GetMemberByIdUseCase implements IGetMemberByIdUseCase {
  constructor(
    private readonly membersRepository: IMembersRepository,
    private readonly permissions: IPermissionService
  ) { }

  async execute(id: string): Promise<Member | null> {
    this.permissions.require('members:read');
    return this.membersRepository.findById(id);
  }
}
