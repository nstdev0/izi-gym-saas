import { BaseRepository } from "./base.repository";
import { IMembersRepository } from "@repositories/members.repository.interface";
import { Member } from "@entities/Member";
import { MembersFilters } from "@repositories/members.repository.interface";
import { Prisma } from "@/generated/prisma/client";
import {
  CreateMemberInput,
  UpdateMemberInput,
} from "@/server/domain/types/members";
import {
  PageableRequest,
  PageableResponse,
} from "@/server/shared/common/pagination";

export class MembersRepository
  extends BaseRepository<
    Prisma.MemberDelegate,
    Member,
    CreateMemberInput,
    UpdateMemberInput,
    MembersFilters
  >
  implements IMembersRepository {

  async findAll(
    request: PageableRequest<MembersFilters> = { page: 1, limit: 10 },
  ): Promise<PageableResponse<Member>> {
    const { page = 1, limit = 10, filters } = request;

    const safePage = page < 1 ? 1 : page;
    const skip = (safePage - 1) * limit;

    let where: Prisma.MemberWhereInput = { deletedAt: null };
    let orderBy: Prisma.MemberOrderByWithRelationInput = { createdAt: "desc" };

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
          memberships: {
            where: { status: "ACTIVE" },
            take: 1,
            orderBy: { endDate: "desc" },
            include: {
              plan: {
                select: { id: true, name: true },
              },
            },
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
      records: records as unknown as Member[],
    };
  }

  async delete(id: string): Promise<Member> {
    const member = await this.model.findUnique({ where: { id } });
    if (!member) throw new Error("Member not found");

    return (await this.model.update({
      where: { id },
      data: {
        status: "INACTIVE",
        deletedAt: new Date(),
        email: member.email ? `${member.email}_deleted_${Date.now()}` : null,
        docNumber: `${member.docNumber}_deleted_${Date.now()}`,
        oldEmail: member.email,
        oldDocNumber: member.docNumber,
      },
    })) as unknown as Member;
  }

  async restore(id: string): Promise<Member> {
    const member = await this.model.findUnique({ where: { id } });
    if (!member) throw new Error("Member not found");

    return (await this.model.update({
      where: { id },
      data: {
        status: "ACTIVE",
        deletedAt: null,
        email: member.oldEmail,
        docNumber: member.oldDocNumber,
        oldEmail: null,
        oldDocNumber: null,
      },
    })) as unknown as Member;
  }


  async buildPrismaClauses(
    filters: MembersFilters,
  ): Promise<[Prisma.MemberWhereInput, Prisma.MemberOrderByWithRelationInput]> {
    const ALLOWED_SORT_FIELDS = ["createdAt", "firstName", "lastName", "gender"] as const
    const ALLOWED_STATUS = ["ACTIVE", "INACTIVE"]

    const conditions: Prisma.MemberWhereInput[] = []

    if (filters.search) {
      const searchTerms = filters.search.trim().split(/\s+/).filter(Boolean);

      if (searchTerms.length > 0) {
        searchTerms.forEach((term) => {
          conditions.push({
            OR: [
              { firstName: { contains: term, mode: "insensitive" } },
              { lastName: { contains: term, mode: "insensitive" } },
              { email: { contains: term, mode: "insensitive" } },
              { phone: { contains: term, mode: "insensitive" } },
              { docNumber: { contains: term, mode: "insensitive" } }
            ],
          })
        })
      }
    }

    if (filters.status && filters.status !== "all") {
      const statusInput = filters.status.toUpperCase();
      const isValidStatus = (ALLOWED_STATUS as readonly string[]).includes(statusInput);

      if (isValidStatus) {
        if (statusInput === "ACTIVE") {
          conditions.push({ memberships: { some: { status: "ACTIVE" } } });
        } else {
          conditions.push({
            memberships: {
              none: {
                status: "ACTIVE"
              }
            }
          });
        }
      }
    }

    const WhereClause: Prisma.MemberWhereInput = conditions.length > 0 ? { AND: conditions } : {}

    // OrderBy
    let OrderByClause: Prisma.MemberOrderByWithRelationInput = { createdAt: "desc" }

    if (filters.sort) {
      const [field, direction] = filters.sort.split("-")
      const isValidField = (ALLOWED_SORT_FIELDS as readonly string[]).includes(field)
      const isValidDirection = direction === "asc" || direction === "desc"

      if (isValidField && isValidDirection) {
        OrderByClause = { [field]: direction as Prisma.SortOrder }
      }
    }
    return [WhereClause, OrderByClause];
  }

  async validateUnique(args: Partial<Member>): Promise<Member | null> {
    // 1. Check Document Uniqueness (only if both docType and docNumber are provided)
    if (args.docType && args.docNumber) {
      const docRecord = await this.findUnique({
        docType_docNumber_organizationId: {
          docType: args.docType,
          docNumber: args.docNumber,
          organizationId: this.organizationId as string,
        },
      } as unknown as Partial<Member>);
      if (docRecord) return docRecord;
    }

    // 2. Check Email Uniqueness (if provided and not empty)
    if (args.email && args.email.trim() !== "") {
      const emailRecord = await this.findUnique({
        email_organizationId: {
          email: args.email,
          organizationId: this.organizationId as string,
        },
      } as unknown as Partial<Member>);
      if (emailRecord) return emailRecord;
    }

    return null;
  }

  async findByIdWithMemberships(id: string): Promise<Member | null> {
    return this.model.findUnique({
      where: { id, organizationId: this.organizationId },
      include: {
        memberships: {
          select: { status: true },
        },
      },
    }) as unknown as Promise<Member | null>;
  }

  async findByQrCode(qrCode: string): Promise<Member | null> {
    return this.model.findUnique({
      where: { qr: qrCode },
    }) as unknown as Promise<Member | null>;
  }
}
