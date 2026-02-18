import { PageableRequest, PageableResponse } from "@/shared/common/pagination";
import { IOrganizationRepository, OrganizationsFilters } from "@/server/application/repositories/organizations.repository.interface";
import { Organization } from "@/server/domain/entities/Organization";
import { IPermissionService } from "@/server/application/services/permission.service.interface";

export class GetAllOrganizationsUseCase {
  constructor(
    private readonly organizationsRepository: IOrganizationRepository,
    private readonly permissions: IPermissionService
  ) { }

  async execute(
    params: PageableRequest<OrganizationsFilters>,
  ): Promise<PageableResponse<Organization>> {
    this.permissions.require('org:list');
    return await this.organizationsRepository.findAll(params);
  }
}

export type IGetAllOrganizationsUseCase = InstanceType<
  typeof GetAllOrganizationsUseCase
>;
