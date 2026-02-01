import { Prisma, PrismaClient } from "@/generated/prisma/client";
import { Membership } from "@/server/domain/entities/Membership";
import { BaseRepository } from "./base.repository";
import { IMembershipsRepository } from "@/server/application/repositories/memberships.repository.interface";
import {
  CreateMembershipInput,
  UpdateMembershipInput,
  MembershipsFilters,
} from "@/server/domain/types/memberships";

export class MembershipsRepository
  extends BaseRepository<
    Prisma.MembershipDelegate,
    Membership,
    CreateMembershipInput,
    UpdateMembershipInput,
    MembershipsFilters
  >
  implements IMembershipsRepository
{
  constructor(prisma: PrismaClient, organizationId: string) {
    super(prisma.membership, organizationId);
  }

  protected async buildQueryFilters(
    filters: MembershipsFilters,
  ): Promise<Prisma.MembershipWhereInput> {
    const query: Prisma.MembershipWhereInput = {};

    // if (filters.search) {
    //   const searchTerms = filters.search.trim().split(/\s+/).filter(Boolean);
    //   if (searchTerms.length > 0) {
    //     query.AND = searchTerms.map((term) => ({
    //       OR: [
    //         { status: { equals: term as any } }, // Simplified cast for search on enum text
    //         // In reality, membership search usually joins User.name etc.
    //         // But base repo filters only on Entity fields unless nested relations are handled.
    //         // For now keeping simple based on previous logic.
    //       ],
    //     }));
    //   }
    // }

    if (filters.status) {
      query.status = filters.status;
    }

    return query;
  }
}
