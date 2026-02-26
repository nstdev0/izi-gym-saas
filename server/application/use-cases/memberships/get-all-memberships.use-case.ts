import { IMembershipsRepository } from "@/server/application/repositories/memberships.repository.interface";
import { MembershipsFilters } from "@/server/domain/types/memberships";
import { Membership } from "@/server/domain/entities/Membership";
import { PageableRequest, PageableResponse } from "@/shared/types/pagination.types";
import { IPermissionService } from "@/server/application/services/permission.service.interface";

export interface IGetAllMembershipsUseCase {
  execute(request: PageableRequest<MembershipsFilters>): Promise<PageableResponse<Membership>>;
}

export class GetAllMembershipsUseCase implements IGetAllMembershipsUseCase {
  constructor(
    private membershipsRepository: IMembershipsRepository,
    private readonly permissions: IPermissionService
  ) { }

  async execute(request: PageableRequest<MembershipsFilters>): Promise<PageableResponse<Membership>> {
    this.permissions.require('memberships:read');

    const response = await this.membershipsRepository.findAll(request);
    response.records.forEach((membership) => {
      membership.pricePaid = Number(membership.pricePaid);
    });
    return response;
  }
}
