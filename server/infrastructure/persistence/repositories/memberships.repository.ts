import { Prisma, PrismaClient } from "@/generated/prisma/client";
import { Membership } from "@/server/domain/entities/Membership";
import { BaseRepository } from "./base.repository";
import { IMembershipsRepository } from "@/server/application/repositories/memberships.repository.interface";
import {
  CreateMembershipInput,
  UpdateMembershipInput,
  MembershipsFilters,
} from "@/server/domain/types/memberships";
import { PageableRequest, PageableResponse } from "@/server/shared/common/pagination";

type MembershipWithRelations = Membership & {
  member?: { firstName: string; lastName: string };
  plan?: { name: string };
};

export class MembershipsRepository
  extends BaseRepository<
    Prisma.MembershipDelegate,
    Membership,
    CreateMembershipInput,
    UpdateMembershipInput,
    MembershipsFilters
  >
  implements IMembershipsRepository {

  private prismaClient: PrismaClient;

  constructor(prisma: PrismaClient, organizationId: string) {
    super(prisma.membership, organizationId);
    this.prismaClient = prisma;
  }

  protected async buildPrismaClauses(
    filters: MembershipsFilters,
  ): Promise<[Prisma.MembershipWhereInput, Prisma.MembershipOrderByWithRelationInput]> {
    const ALLOWED_SORT_FIELDS = ["createdAt", "startDate", "endDate", "pricePaid"] as const;
    const ALLOWED_STATUS = ["ACTIVE", "EXPIRED", "PENDING", "CANCELLED"] as const;

    const conditions: Prisma.MembershipWhereInput[] = [];

    // Search filter (by member name via relation)
    if (filters.search) {
      const searchTerms = filters.search.trim().split(/\s+/).filter(Boolean);
      if (searchTerms.length > 0) {
        searchTerms.forEach((term) => {
          conditions.push({
            OR: [
              { member: { firstName: { contains: term, mode: "insensitive" } } },
              { member: { lastName: { contains: term, mode: "insensitive" } } },
              { plan: { name: { contains: term, mode: "insensitive" } } },
            ],
          });
        });
      }
    }

    // Status filter
    if (filters.status) {
      const statusInput = filters.status.toUpperCase();
      const isValidStatus = (ALLOWED_STATUS as readonly string[]).includes(statusInput);
      if (isValidStatus) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        conditions.push({ status: statusInput as any });
      }
    }

    // Member filter
    if (filters.memberId) {
      conditions.push({ memberId: filters.memberId });
    }

    // Plan filter
    if (filters.planId) {
      conditions.push({ planId: filters.planId });
    }

    const WhereClause: Prisma.MembershipWhereInput = conditions.length > 0 ? { AND: conditions } : {};

    // Sort
    let OrderByClause: Prisma.MembershipOrderByWithRelationInput = { createdAt: "desc" };

    if (filters.sort) {
      const [field, direction] = filters.sort.split("-");
      const isValidField = (ALLOWED_SORT_FIELDS as readonly string[]).includes(field);
      const isValidDirection = direction === "asc" || direction === "desc";

      if (isValidField && isValidDirection) {
        OrderByClause = { [field]: direction as Prisma.SortOrder };
      }
    }

    return [WhereClause, OrderByClause];
  }

  // Override findAll to include member and plan relations
  async findAll(
    request: PageableRequest<MembershipsFilters> = { page: 1, limit: 10 },
  ): Promise<PageableResponse<MembershipWithRelations>> {
    const { page = 1, limit = 10, filters } = request;

    const safePage = page < 1 ? 1 : page;
    const skip = (safePage - 1) * limit;

    let where: Prisma.MembershipWhereInput = {};
    let orderBy: Prisma.MembershipOrderByWithRelationInput = { createdAt: "desc" };

    if (filters) {
      const [whereClause, orderByClause] = await this.buildPrismaClauses(filters);
      where = whereClause;
      orderBy = orderByClause;
    }

    if (this.organizationId) {
      where = { ...where, organizationId: this.organizationId };
    }

    const [totalRecords, records] = await Promise.all([
      this.prismaClient.membership.count({ where }),
      this.prismaClient.membership.findMany({
        skip,
        take: limit,
        where,
        orderBy,
        include: {
          member: {
            select: { firstName: true, lastName: true },
          },
          plan: {
            select: { name: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalRecords / limit);

    return {
      currentPage: page,
      pageSize: limit,
      totalRecords,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
      records: records as unknown as MembershipWithRelations[],
    };
  }

  // Override findUnique to include member and plan relations
  async findUnique(args: Partial<Membership>): Promise<MembershipWithRelations | null> {
    const result = await this.prismaClient.membership.findUnique({
      where: {
        id: args.id,
        organizationId: this.organizationId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      include: {
        member: {
          select: { firstName: true, lastName: true },
        },
        plan: {
          select: { name: true },
        },
      },
    });

    return result as MembershipWithRelations | null;
  }

  async findActiveMembershipByMemberId(memberId: string): Promise<Membership | null> {
    const result = await this.prismaClient.membership.findFirst({
      where: {
        memberId,
        organizationId: this.organizationId,
        status: {
          in: ["ACTIVE", "PENDING"],
        },
      },
    });

    return result as Membership | null;
  }
}
