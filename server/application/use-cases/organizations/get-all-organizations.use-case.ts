import {
  PageableRequest,
  PageableResponse,
} from "@/shared/common/pagination";
import {
  IOrganizationRepository,
  OrganizationsFilters,
} from "../../repositories/organizations.repository.interface";
import { Organization } from "@/server/domain/entities/Organization";

export class GetAllOrganizationsUseCase {
  constructor(
    private readonly organizationsRepository: IOrganizationRepository,
  ) { }

  async execute(
    params: PageableRequest<OrganizationsFilters>,
  ): Promise<PageableResponse<Organization>> {
    return await this.organizationsRepository.findAll(params);
  }
}

export type IGetAllOrganizationsUseCase = InstanceType<
  typeof GetAllOrganizationsUseCase
>;
