import {
  PageableRequest,
  PageableResponse,
} from "@/shared/common/pagination";
import { Member } from "@entities/Member";
import {
  IMembersRepository,
  MembersFilters,
} from "@repositories/members.repository.interface";

import { IPermissionService } from "@/server/application/services/permission.service.interface";

export class GetAllMembersUseCase {
  constructor(
    private readonly repository: IMembersRepository,
    private readonly permissions: IPermissionService
  ) { }

  async execute(
    request: PageableRequest<MembersFilters>,
  ): Promise<PageableResponse<Member>> {
    this.permissions.require('members:read');
    return await this.repository.findAll(request);
  }
}

export type IGetAllMembersUseCase = InstanceType<typeof GetAllMembersUseCase>;
