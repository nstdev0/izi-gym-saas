import { MembersFilters } from "@/server/application/repositories/members.repository.interface";
import { IGetAllMembersUseCase } from "@/server/application/use-cases/members/get-all-members.use-case";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { PageableRequest, PageableResponse } from "@/shared/common/pagination";
import { MemberResponse } from "@/shared/types/members.types";
import { MemberResponseMapper } from "../../mappers/member-response.mapper";

export class GetAllMembersController implements ControllerExecutor<PageableRequest<MembersFilters>, PageableResponse<MemberResponse>> {
  constructor(private readonly useCase: IGetAllMembersUseCase) { }

  async execute(request: PageableRequest<MembersFilters>): Promise<PageableResponse<MemberResponse>> {
    const result = await this.useCase.execute(request);
    return {
      ...result,
      records: MemberResponseMapper.toResponseArray(result.records),
    };
  }
}
