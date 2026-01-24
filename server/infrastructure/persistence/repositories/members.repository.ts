import { BaseRepository } from "./base.repository";
import { IMembersRepository } from "@repositories/members.repository.interface";
import { Member } from "@entities/Member";
import { MembersFilters } from "@repositories/members.repository.interface";
import { Prisma } from "@/generated/prisma/client";
import {
  CreateMemberInput,
  UpdateMemberInput,
} from "@/server/application/dtos/create-member.dto";

export class MembersRepository
  extends BaseRepository<
    Prisma.MemberDelegate,
    Member,
    CreateMemberInput,
    UpdateMemberInput,
    MembersFilters
  >
  implements IMembersRepository
{
  async buildQueryFilters(
    filters: MembersFilters,
  ): Promise<Prisma.MemberWhereInput> {
    const whereClause: Prisma.MemberWhereInput = {};

    if (filters.search) {
      const searchTerms = filters.search.trim().split(/\s+/).filter(Boolean);

      if (searchTerms.length > 0) {
        whereClause.AND = searchTerms.map((term) => ({
          OR: [
            { firstName: { contains: term, mode: "insensitive" } },
            { lastName: { contains: term, mode: "insensitive" } },
            { email: { contains: term, mode: "insensitive" } },
          ],
        }));
      }
    }
    return whereClause;
  }
}
