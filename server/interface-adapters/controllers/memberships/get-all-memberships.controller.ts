import { MembershipsFilters } from "@/server/domain/types/memberships";
import { IGetAllMembershipsUseCase } from "@/server/application/use-cases/memberships/get-all-memberships.use-case";
import { PageableRequest, PageableResponse } from "@/shared/common/pagination";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { MembershipResponse } from "@/shared/types/memberships.types";
import { MembershipResponseMapper } from "../../mappers/membership-response.mapper";

export class GetAllMembershipsController implements ControllerExecutor<PageableRequest<MembershipsFilters>, PageableResponse<MembershipResponse>> {
  constructor(private readonly useCase: IGetAllMembershipsUseCase) { }

  async execute(request: PageableRequest<MembershipsFilters>): Promise<PageableResponse<MembershipResponse>> {
    const result = await this.useCase.execute(request);
    return {
      ...result,
      records: MembershipResponseMapper.toResponseArray(result.records),
    };
  }
}
