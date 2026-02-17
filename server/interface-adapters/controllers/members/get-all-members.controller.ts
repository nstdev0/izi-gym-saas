import { MembersFilters } from "@/server/application/repositories/members.repository.interface";
import { IGetAllMembersUseCase } from "@/server/application/use-cases/members/get-all-members.use-case";
import { Member } from "@/server/domain/entities/Member";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { PageableRequest, PageableResponse } from "@/shared/common/pagination";

export class GetAllMembersController implements ControllerExecutor<PageableRequest<MembersFilters>, PageableResponse<Member>> {
  constructor(private readonly useCase: IGetAllMembersUseCase) { }

  async execute(request: PageableRequest<MembersFilters>) {
    return await this.useCase.execute(request);
  }
}
