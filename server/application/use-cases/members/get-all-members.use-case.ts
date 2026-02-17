import {
  PageableRequest,
  PageableResponse,
} from "@/shared/common/pagination";
import { Member } from "@entities/Member";
import {
  IMembersRepository,
  MembersFilters,
} from "@repositories/members.repository.interface";

export class GetAllMembersUseCase {
  constructor(private readonly repository: IMembersRepository) { }

  async execute(
    request: PageableRequest<MembersFilters>,
  ): Promise<PageableResponse<Member>> {
    return await this.repository.findAll(request);
  }
}

export type IGetAllMembersUseCase = InstanceType<typeof GetAllMembersUseCase>;
