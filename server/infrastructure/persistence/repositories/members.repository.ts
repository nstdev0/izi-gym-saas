import { BaseRepository } from "./base.repository";
import { IMembersRepository } from "@repositories/members.repository.interface";
import { Member } from "@entities/Member";
import { MembersFilters } from "@repositories/members.repository.interface";
import { Prisma, DocType } from "@/generated/prisma/client";
import {
  CreateMemberInput,
  UpdateMemberInput,
} from "@/server/domain/types/members";
import {
  PageableRequest,
  PageableResponse,
} from "@/shared/common/pagination";
import { NotFoundError } from "@/server/domain/errors/common";
import { MemberMapper } from "../mappers/members.mapper";
import { translatePrismaError } from "../prisma-error-translator";



export class MembersRepository
  extends BaseRepository<
    Prisma.MemberDelegate,
    Member,
    CreateMemberInput,
    UpdateMemberInput,
    MembersFilters
  >
  implements IMembersRepository {

  constructor(model: Prisma.MemberDelegate, organizationId: string) {
    super(model, new MemberMapper(), organizationId, "Miembro")
  }

  async findAll(
    request: PageableRequest<MembersFilters> = { page: 1, limit: 10 },
  ): Promise<PageableResponse<Member>> {
    const { page = 1, limit = 10, filters } = request;

    const safePage = page < 1 ? 1 : page;
    const skip = (safePage - 1) * limit;

    let where: Prisma.MemberWhereInput = { deletedAt: null, isActive: true };
    let orderBy: Prisma.MemberOrderByWithRelationInput = { createdAt: "desc" };

    if (filters) {
      const [whereClause, orderByClause] = await this.buildPrismaClauses(filters);
      where = { ...where, ...whereClause };
      orderBy = orderByClause;
    }

    if (this.organizationId) {
      where = { ...where, organizationId: this.organizationId };
    }

    try {
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

      const mappedRecords = records.map((record) => {
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
      translatePrismaError(error, "Miembros")
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const member = await this.model.findUnique({ where: { id } });
      if (!member) throw new NotFoundError("Miembro no encontrado");

      await this.model.update({
        where: { id },
        data: {
          isActive: false,
          deletedAt: new Date(),
          email: this.softDelete(member.email),
          docNumber: this.softDelete(member.docNumber) || "",
        },
      })
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      translatePrismaError(error, "Miembro")
    }
  }

  async restore(id: string): Promise<void> {
    try {
      const member = await this.model.findUnique({ where: { id } });
      if (!member) throw new NotFoundError("Miembro no encontrado");

      await this.model.update({
        where: { id },
        data: {
          isActive: true,
          deletedAt: null,
          email: this.restoreField(member.email),
          docNumber: this.restoreField(member.docNumber) || "",
        },
      })
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      translatePrismaError(error, "Miembro")
    }
  }


  protected async buildPrismaClauses(
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

    // Gender filter
    if (filters.gender && filters.gender !== "all") {
      const genderUpper = filters.gender.toUpperCase();
      if (["MALE", "FEMALE"].includes(genderUpper)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        conditions.push({ gender: genderUpper as any });
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

  async validateUniqueEmail(email: string | null | undefined): Promise<Member | null> {
    try {
      if (!email) return null;
      const emailRecord = await this.model.findUnique({
        where: {
          email_organizationId: {
            email,
            organizationId: this.organizationId as string,
          },
        }
      });

      if (emailRecord) return this.mapper.toDomain(emailRecord);
      return null;
    } catch (error) {
      translatePrismaError(error, "Miembro")
    }
  }

  async validateUniqueDocument(docType: DocType, docNumber: string): Promise<Member | null> {
    try {
      const docRecord = await this.model.findUnique({
        where: {
          docType_docNumber_organizationId: {
            docType,
            docNumber,
            organizationId: this.organizationId as string,
          },
        }
      });
      if (docRecord) return this.mapper.toDomain(docRecord);
      return null;
    } catch (error) {
      translatePrismaError(error, "Miembro")
    }
  }

  async findByIdWithMemberships(id: string): Promise<Member | null> {
    try {
      const record = await this.model.findUnique({
        where: { id, organizationId: this.organizationId },
        include: {
          memberships: {
            select: { status: true },
          },
        },
      });

      if (!record) return null;
      // @ts-ignore
      return this.mapper.toDomain(record);
    } catch (error) {
      translatePrismaError(error, "Miembro")
    }
  }

  async findByQrCode(qrCode: string): Promise<Member | null> {
    try {
      const record = await this.model.findUnique({
        where: { qr_organizationId: { qr: qrCode, organizationId: this.organizationId! } },
        include: {
          memberships: {
            select: { status: true },
          },
        },
      });
      if (!record) return null;
      return this.mapper.toDomain(record);
    } catch (error) {
      translatePrismaError(error, "Miembro")
    }
  }

  async countActive(organizationId: string): Promise<number> {
    return this.model.count({
      where: { organizationId, deletedAt: null, isActive: true },
    })
  }
}
