import { Prisma } from "@/generated/prisma/client";
import { User } from "@/server/domain/entities/User";
import { BaseRepository } from "./base.repository";
import { IUsersRepository } from "@/server/application/repositories/users.repository.interface";
import {
  CreateUserInput,
  UpdateUserInput,
  UsersFilters,
} from "@/server/domain/types/users";

export class UsersRepository
  extends BaseRepository<
    Prisma.UserDelegate,
    User,
    CreateUserInput,
    UpdateUserInput,
    UsersFilters
  >
  implements IUsersRepository {
  async create(data: CreateUserInput): Promise<User> {
    const { password, id, ...rest } = data;
    // Si viene ID (de Clerk), lo usamos.
    const prismaData = {
      ...rest,
      id: id,
      passwordHash: password,
    };

    return (await this.model.create({
      data: { ...prismaData, organizationId: this.organizationId } as any,
    })) as unknown as User;
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    const { password, ...rest } = data;
    const prismaData: any = { ...rest };
    if (password) {
      prismaData.passwordHash = password;
    }

    return (await this.model.update({
      data: { ...prismaData, organizationId: this.organizationId } as any,
      where: { id },
    })) as unknown as User;
  }

  protected async buildPrismaClauses(
    filters: UsersFilters,
  ): Promise<[Prisma.UserWhereInput, Prisma.UserOrderByWithRelationInput]> {
    const ALLOWED_SORT_FIELDS = ["createdAt", "updatedAt", "firstName", "lastName", "email"];

    const WhereClause: Prisma.UserWhereInput = {}

    if (filters.search) {
      const searchTerms = filters.search.trim().split(/\s+/).filter(Boolean);

      if (searchTerms.length > 0) {
        WhereClause.AND = searchTerms.map((term) => ({
          OR: [
            { firstName: { contains: term, mode: "insensitive" } },
            { lastName: { contains: term, mode: "insensitive" } },
            { email: { contains: term, mode: "insensitive" } },
            { role: { contains: term, mode: "insensitive" } }
          ],
        }));
      }
    }

    let OrderByClause: Prisma.UserOrderByWithRelationInput = { createdAt: "desc" };

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
}
