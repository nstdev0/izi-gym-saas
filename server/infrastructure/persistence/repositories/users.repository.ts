import { Prisma } from "@/generated/prisma/client";
import { User, UserWithMembership } from "@/server/domain/entities/User";
import { BaseRepository } from "./base.repository";
import { IUsersRepository } from "@/server/application/repositories/users.repository.interface";
import {
  CreateUserInput,
  UpdateUserInput,
  UsersFilters,
} from "@/server/domain/types/users";
import { UserMapper } from "../mappers/users.mapper";
import { translatePrismaError } from "../prisma-error-translator";
import { PageableRequest, PageableResponse } from "@/shared/types/pagination.types";

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
      const { password, id, role, ...rest } = data;
      const prismaData = {
        ...rest,
        id: id,
        passwordHash: password,
      };

      const entity = await this.model.create({
        data: {
          ...prismaData,
          memberships: this.organizationId ? {
            create: {
              organizationId: this.organizationId,
              role: role ? (role.toUpperCase() as any) : "STAFF",
            }
          } : undefined
        },
      });
      return this.mapper.toDomain(entity);
    } catch (error) {
      translatePrismaError(error, "Usuario")
    }
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    try {
      const { password, role, ...rest } = data;
      const prismaData: any = { ...rest };
      if (password) {
        prismaData.passwordHash = password;
      }

      const updateData: Prisma.UserUpdateInput = { ...prismaData };

      if (role && this.organizationId) {
        updateData.memberships = {
          update: {
            where: {
              userId_organizationId: {
                userId: id,
                organizationId: this.organizationId
              }
            },
            data: {
              role: role.toUpperCase() as any
            }
          }
        };
      }

      const entity = await this.model.update({
        data: updateData,
        where: { id },
      });
      return this.mapper.toDomain(entity);
    } catch (error) {
      translatePrismaError(error, "Usuario")
    }
  }

  async countActive(organizationId: string): Promise<number> {
    return this.model.count({
      where: {
        deletedAt: null,
        isActive: true,
        memberships: {
          some: {
            organizationId,
            isActive: true
          }
        }
      },
    })
  }

  protected async buildPrismaClauses(
    filters: UsersFilters,
  ): Promise<[Prisma.UserWhereInput, Prisma.UserOrderByWithRelationInput]> {
    const ALLOWED_SORT_FIELDS = ["createdAt", "updatedAt", "firstName", "lastName", "email"];
    const ALLOWED_ROLES = ["owner", "admin", "staff", "trainer"] as const;
    const ALLOWED_STATUS = ["active", "inactive"] as const;

    const conditions: Prisma.UserWhereInput[] = [
      {
        memberships: {
          some: { organizationId: this.organizationId }
        }
      }
    ];

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
        conditions.push({
          memberships: {
            some: {
              organizationId: this.organizationId,
              role: roleInput.toUpperCase() as any
            }
          }
        });
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

  // --- Overrides para devolver UserWithMembership ---

  async findById(id: string): Promise<User | null> {
    try {
      const entity = await this.model.findUnique({
        where: { id },
        include: {
          memberships: {
            where: { organizationId: this.organizationId, isActive: true },
            take: 1
          }
        }
      });

      if (!entity) return null;

      const domainUser = this.mapper.toDomain(entity as any);
      const membership = entity.memberships?.[0];

      if (membership && this.organizationId) {
        return new UserWithMembership(
          domainUser,
          this.organizationId,
          membership.role as any
        );
      }
      return domainUser;
    } catch (error) {
      translatePrismaError(error, "Usuario");
    }
  }

  async findAll(
    request: PageableRequest<UsersFilters> = { page: 1, limit: 10 },
  ): Promise<PageableResponse<User>> {
    try {
      const { page = 1, limit = 10, filters } = request;

      const safePage = page < 1 ? 1 : page;
      const skip = (safePage - 1) * limit;

      let where: any = { deletedAt: null };
      let orderBy: any = { createdAt: "desc" };

      if (this.organizationId) {
        where.memberships = {
          some: { organizationId: this.organizationId, isActive: true }
        };
      }

      if (filters) {
        const [whereClause, orderByClause] = await this.buildPrismaClauses(filters);
        where = { ...where, ...whereClause };

        if (orderByClause) orderBy = orderByClause;
      }

      const [totalRecords, records] = await Promise.all([
        this.model.count({ where }),
        this.model.findMany({
          skip,
          take: limit,
          where,
          orderBy: orderBy,
          include: {
            memberships: {
              where: { organizationId: this.organizationId, isActive: true },
              take: 1
            }
          }
        }),
      ]);

      const totalPages = Math.ceil(totalRecords / limit);

      const UserWithMembershipClass = UserWithMembership;

      const mappedRecords = records.map((record) => {
        const domainUser = this.mapper.toDomain(record as any);
        const membership = record.memberships?.[0];

        if (membership && this.organizationId) {
          return new UserWithMembershipClass(
            domainUser,
            this.organizationId,
            membership.role as any
          );
        }
        return domainUser;
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
      translatePrismaError(error, "Usuario");
    }
  }
}
