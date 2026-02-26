import { ISystemRepository } from "@/server/application/repositories/system.repository.interface";
import { OrganizationsFilters } from "@/server/domain/types/organizations";
import { Organization } from "@/server/domain/entities/Organization";
import { PageableRequest, PageableResponse } from "@/shared/types/pagination.types";

export interface ISystemGetAllOrganizationsUseCase {
    execute(request: PageableRequest<OrganizationsFilters>): Promise<PageableResponse<Organization>>;
}

export class SystemGetAllOrganizationsUseCase implements ISystemGetAllOrganizationsUseCase {
    constructor(private readonly systemRepository: ISystemRepository) { }

    async execute(request: PageableRequest<OrganizationsFilters>): Promise<PageableResponse<Organization>> {
        return this.systemRepository.getAllOrganizations(request);
    }
}
