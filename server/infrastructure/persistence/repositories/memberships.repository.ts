import { Prisma } from "@/generated/prisma/client";
import { Membership } from "@/server/domain/entities/Membership";
import { BaseRepository } from "./base.repository";
import { IMembershipsRepository } from "@/server/application/repositories/memberships.repository.interface";
import {
  CreateMembershipInput,
  UpdateMembershipInput,
  MembershipsFilters,
} from "@/server/domain/types/memberships";
import { PageableRequest, PageableResponse } from "@/shared/common/pagination";
import { MembershipMapper } from "../mappers/memberships.mapper";
import { translatePrismaError } from "../prisma-error-translator";



export class MembershipsRepository
  extends BaseRepository<
    Prisma.MembershipDelegate,
    Membership,
    CreateMembershipInput,
    UpdateMembershipInput,
    MembershipsFilters
  >
  implements IMembershipsRepository {

  constructor(model: Prisma.MembershipDelegate, organizationId: string) {
    super(model, new MembershipMapper(), organizationId, "Membresía");
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

  async findAll(
    request: PageableRequest<MembershipsFilters> = { page: 1, limit: 10 },
  ): Promise<PageableResponse<Membership>> {
    try {
      const { page = 1, limit = 10, filters } = request;

      const safePage = page < 1 ? 1 : page;
      const skip = (safePage - 1) * limit;

      let where: Prisma.MembershipWhereInput = { deletedAt: null };
      let orderBy: Prisma.MembershipOrderByWithRelationInput = { createdAt: "desc" };

      if (filters) {
        const [whereClause, orderByClause] = await this.buildPrismaClauses(filters);
        where = { ...where, ...whereClause };
        orderBy = orderByClause;
      }

      if (this.organizationId) {
        where = { ...where, organizationId: this.organizationId };
      }

      const [totalRecords, records] = await Promise.all([
        this.model.count({ where }),
        this.model.findMany({
          skip,
          take: limit,
          where,
          orderBy,
          include: {
            member: {
              select: { firstName: true, lastName: true, image: true, docNumber: true },
            },
            plan: {
              select: { name: true },
            },
          },
        }),
      ]);

      const totalPages = Math.ceil(totalRecords / limit);

      const mappedRecords = records.map((record) => {
        // @ts-ignore
        return this.mapper.toDomain(record);
      });

      return {
        currentPage: page,
        pageSize: limit,
        totalRecords,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
        records: mappedRecords,
      };
    } catch (error) {
      translatePrismaError(error, "Membresía")
    }
  }

  async findActiveMembershipByMemberId(memberId: string): Promise<Membership | null> {
    try {
      const result = await this.model.findFirst({
        where: {
          memberId,
          organizationId: this.organizationId,
          deletedAt: null,
          status: {
            in: ["ACTIVE", "PENDING"],
          },
        },
        include: {
          plan: true,

        }
      });

      if (!result) return null;
      return this.mapper.toDomain(result);
    } catch (error) {
      translatePrismaError(error, "Membresía")
    }
  }

  async cancel(id: string): Promise<void> {
    try {
      await this.model.update({
        where: { id, organizationId: this.organizationId },
        data: { status: "CANCELLED" },
      });
    } catch (error) {
      translatePrismaError(error, "Membresía")
    }
  }
}
