import {
  PageableRequest,
  PageableResponse,
} from "@/server/shared/common/pagination";
import { Member } from "@entities/Member";
import {
  IMembersRepository,
  MembersFilters,
} from "@repositories/members.repository.interface";

export class GetAllMembersUseCase {
  constructor(private readonly membersRepo: IMembersRepository) {}

  async execute(
    params: PageableRequest<MembersFilters>,
  ): Promise<PageableResponse<Member>> {
    return await this.membersRepo.findAll(params);
  }
}

export type IGetAllMembersUseCase = InstanceType<typeof GetAllMembersUseCase>;
