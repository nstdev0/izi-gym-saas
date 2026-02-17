import { ISystemGetAllOrganizationsUseCase } from "@/server/application/use-cases/system/system-get-all-organizations.use-case";
import { OrganizationsFilters } from "@/server/domain/types/organizations";
import { PageableRequest } from "@/shared/common/pagination";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { PageableResponse } from "@/shared/common/pagination";
import { Organization } from "@/shared/types/organizations.types";

export class SystemGetAllOrganizationsController implements ControllerExecutor<PageableRequest<OrganizationsFilters>, PageableResponse<Organization>> {
    constructor(private readonly getAllOrganizationsUseCase: ISystemGetAllOrganizationsUseCase) { }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(input: PageableRequest<OrganizationsFilters>, id?: string | undefined) {
        const result = await this.getAllOrganizationsUseCase.execute(input);

        return {
            ...result,
            records: result.records.map(org => ({ ...org }))
        };
    }
}
