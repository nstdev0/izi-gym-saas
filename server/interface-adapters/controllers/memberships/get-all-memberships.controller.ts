import { MembershipsFilters } from "@/server/domain/types/memberships";
import { IGetAllMembershipsUseCase } from "@/server/application/use-cases/memberships/get-all-memberships.use-case";
import { PageableRequest } from "@/server/shared/common/pagination";

export class GetAllMembershipsController {
  constructor(private useCase: IGetAllMembershipsUseCase) {}

  async execute(request: PageableRequest<MembershipsFilters>) {
    return await this.useCase.execute(
      request.filters || {},
      request.page,
      request.limit,
    );
  }
}
