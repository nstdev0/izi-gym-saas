import { MembershipsFilters } from "@/server/domain/types/memberships";
import { IGetAllMembershipsUseCase } from "@/server/application/use-cases/memberships/get-all-memberships.use-case";
import { PageableRequest, PageableResponse } from "@/shared/common/pagination";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { Membership } from "@/shared/types/memberships.types";

export class GetAllMembershipsController implements ControllerExecutor<PageableRequest<MembershipsFilters>, PageableResponse<Membership>> {
  constructor(private readonly useCase: IGetAllMembershipsUseCase) { }

  async execute(request: PageableRequest<MembershipsFilters>): Promise<PageableResponse<Membership>> {
    return await this.useCase.execute(request);
  }
}
