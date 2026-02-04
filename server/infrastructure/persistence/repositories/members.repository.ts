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
