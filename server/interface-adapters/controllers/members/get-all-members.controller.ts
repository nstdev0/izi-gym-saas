import { MembersFilters } from "@/server/application/repositories/members.repository.interface";
import { IGetAllMembersUseCase } from "@/server/application/use-cases/members/get-all-members.use-case";
import { PageableRequest } from "@/server/shared/common/pagination";

export class GetAllMembersController {
  constructor(private readonly getAllMembersUseCase: IGetAllMembersUseCase) {}

  async execute(input: PageableRequest<MembersFilters>) {
    return await this.getAllMembersUseCase.execute(input);
  }
}
