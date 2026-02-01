import { IMembershipsRepository } from "@/server/application/repositories/memberships.repository.interface";
import { MembershipsFilters } from "@/server/domain/types/memberships";
import { Membership } from "@/server/domain/entities/Membership";
import { PageableResponse } from "@/server/shared/common/pagination";

export interface IGetAllMembershipsUseCase {
  execute(
    filters: MembershipsFilters,
    page: number,
    limit: number,
  ): Promise<PageableResponse<Membership>>;
}

export class GetAllMembershipsUseCase implements IGetAllMembershipsUseCase {
  constructor(private membershipsRepository: IMembershipsRepository) {}

  async execute(
    filters: MembershipsFilters,
    page: number = 1,
    limit: number = 10,
  ): Promise<PageableResponse<Membership>> {
    return this.membershipsRepository.findAll({ filters, page, limit });
  }
}
