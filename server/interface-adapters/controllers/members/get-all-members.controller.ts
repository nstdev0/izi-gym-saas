import { MembersFilters } from "@/server/application/repositories/members.repository.interface";
import { IGetAllMembersUseCase } from "@/server/application/use-cases/members/get-all-members.use-case";
import { PageableRequest } from "@/server/shared/common/pagination";

export class GetAllMembersController {
  constructor(private readonly useCase: IGetAllMembersUseCase) {}

  async execute(filters: PageableRequest<MembersFilters>) {
    return await this.useCase.execute(filters);
  }
}
