import { BaseRepository } from "./base.repository";
import { IMembersRepository } from "@repositories/members.repository.interface";
import { Member } from "@entities/Member";
import { MembersFilters } from "@repositories/members.repository.interface";
import { Prisma } from "@/generated/prisma/client";
import {
  CreateMemberInput,
  UpdateMemberInput,
} from "@/server/domain/types/members";

export class MembersRepository
  extends BaseRepository<
    Prisma.MemberDelegate,
    Member,
    CreateMemberInput,
    UpdateMemberInput,
    MembersFilters
  >
  implements IMembersRepository {
  async buildPrismaClauses(
    filters: MembersFilters,
  ): Promise<[Prisma.MemberWhereInput, Prisma.MemberOrderByWithRelationInput]> {
    const ALLOWED_SORT_FIELDS = ["createdAt", "firstName", "lastName", "gender"] as const

    // Where
    const WhereClause: Prisma.MemberWhereInput = {}

    if (filters.search) {
      const searchTerms = filters.search.trim().split(/\s+/).filter(Boolean);

      if (searchTerms.length > 0) {
        WhereClause.AND = searchTerms.map((term) => ({
          OR: [
            { firstName: { contains: term, mode: "insensitive" } },
            { lastName: { contains: term, mode: "insensitive" } },
            { email: { contains: term, mode: "insensitive" } },
            { phone: { contains: term, mode: "insensitive" } }
          ],
        }))
      }
    }

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
    // 1. Check Document Uniqueness
    const docRecord = await this.findUnique({
      docType_docNumber_organizationId: {
        docType: args.docType,
        docNumber: args.docNumber,
        organizationId: this.organizationId as string,
      },
    } as unknown as Partial<Member>);
    if (docRecord) return docRecord;

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
}
