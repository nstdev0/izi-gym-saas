import {
  PageableRequest,
  PageableResponse,
} from "@/shared/types/pagination.types";
import { Member } from "@/server/domain/entities/Member";
import {
  IMembersRepository,
  MembersFilters,
} from "@/server/application/repositories/members.repository.interface";

import { IPermissionService } from "@/server/application/services/permission.service.interface";

export class GetAllMembersUseCase {
  constructor(
    private readonly repository: IMembersRepository,
    private readonly permissions: IPermissionService
  ) { }

  async execute(
    request: PageableRequest<MembersFilters>
  ): Promise<PageableResponse<Member>> {
    this.permissions.require('members:read');
    return await this.repository.findAll(request);
  }
}

export type IGetAllMembersUseCase = InstanceType<typeof GetAllMembersUseCase>;
