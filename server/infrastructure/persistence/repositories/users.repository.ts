import { Prisma } from "@/generated/prisma/client";
import { User } from "@/server/domain/entities/User";
import { BaseRepository } from "./base.repository";
import { IUsersRepository } from "@/server/application/repositories/users.repository.interface";
import {
  CreateUserInput,
  UpdateUserInput,
  UsersFilters,
} from "@/server/domain/types/users";
import { UserMapper } from "../mappers/users.mapper";
import { translatePrismaError } from "../prisma-error-translator";

export class UsersRepository
  extends BaseRepository<
    Prisma.UserDelegate,
    User,
    CreateUserInput,
    UpdateUserInput,
    UsersFilters
  >
  implements IUsersRepository {

  constructor(model: Prisma.UserDelegate, organizationId: string) {
    super(model, new UserMapper(), organizationId, "Usuario");
  }
  async create(data: CreateUserInput): Promise<User> {
    try {
      const { password, id, ...rest } = data;
      // Si viene ID (de Clerk), lo usamos.
      const prismaData = {
        ...rest,
        id: id,
        passwordHash: password,
      };

      const entity = await this.model.create({
        data: { ...prismaData, organizationId: this.organizationId },
      });
      return this.mapper.toDomain(entity);
    } catch (error) {
      translatePrismaError(error, "Usuario")
    }
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    try {
      const { password, ...rest } = data;
      const prismaData: any = { ...rest };
      if (password) {
        prismaData.passwordHash = password;
      }

      const entity = await this.model.update({
        data: { ...prismaData, organizationId: this.organizationId } as any,
        where: { id },
      });
      return this.mapper.toDomain(entity);
    } catch (error) {
      translatePrismaError(error, "Usuario")
    }
  }

  protected async buildPrismaClauses(
    filters: UsersFilters,
  ): Promise<[Prisma.UserWhereInput, Prisma.UserOrderByWithRelationInput]> {
    const ALLOWED_SORT_FIELDS = ["createdAt", "updatedAt", "firstName", "lastName", "email"];
    const ALLOWED_ROLES = ["owner", "admin", "staff", "trainer"] as const;
    const ALLOWED_STATUS = ["active", "inactive"] as const;

    const conditions: Prisma.UserWhereInput[] = [];

    // Search filter
    if (filters.search) {
      const searchTerms = filters.search.trim().split(/\s+/).filter(Boolean);

      if (searchTerms.length > 0) {
        searchTerms.forEach((term) => {
          conditions.push({
            OR: [
              { firstName: { contains: term, mode: "insensitive" } },
              { lastName: { contains: term, mode: "insensitive" } },
              { email: { contains: term, mode: "insensitive" } },
            ],
          });
        });
      }
    }

    // Role filter
    if (filters.role) {
      const roleInput = filters.role.toLowerCase();
      const isValidRole = (ALLOWED_ROLES as readonly string[]).includes(roleInput);

      if (isValidRole) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        conditions.push({ role: { equals: roleInput.toUpperCase() as any } });
      }
    }

    // Status filter
    if (filters.status) {
      const statusInput = filters.status.toLowerCase();
      const isValidStatus = (ALLOWED_STATUS as readonly string[]).includes(statusInput);

      if (isValidStatus) {
        conditions.push({ isActive: statusInput === "active" });
      }
    }

    const WhereClause: Prisma.UserWhereInput = conditions.length > 0 ? { AND: conditions } : {};

    // Sort
    let OrderByClause: Prisma.UserOrderByWithRelationInput = { createdAt: "desc" };

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

  async countActive(organizationId: string): Promise<number> {
    return this.model.count({
      where: { organizationId, deletedAt: null, isActive: true },
    })
  }

}
