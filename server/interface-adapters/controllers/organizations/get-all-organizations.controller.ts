import { OrganizationsFilters } from "@/server/application/repositories/organizations.repository.interface";
import { IGetAllOrganizationsUseCase } from "@/server/application/use-cases/organizations/get-all-organizations.use-case";
import { PageableRequest } from "@/shared/common/pagination";

export class GetAllOrganizationsController {
  constructor(
    private readonly getAllOrganizationsUseCase: IGetAllOrganizationsUseCase,
  ) { }

  async execute(filters: PageableRequest<OrganizationsFilters>) {
    return await this.getAllOrganizationsUseCase.execute(filters);
  }
}

export type IGetAllOrganizationsController = InstanceType<
  typeof GetAllOrganizationsController
>;
