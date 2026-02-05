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

  protected async buildQueryFilters(
    filters: UsersFilters,
  ): Promise<Prisma.UserWhereInput> {
    const query: Prisma.UserWhereInput = {};

    if (filters.search) {
      const searchTerms = filters.search.trim().split(/\s+/).filter(Boolean);
      if (searchTerms.length > 0) {
        query.AND = searchTerms.map((term) => ({
          OR: [
            { firstName: { contains: term, mode: "insensitive" } },
            { lastName: { contains: term, mode: "insensitive" } },
            { email: { contains: term, mode: "insensitive" } },
          ],
        }));
      }
    }

    if (filters.role) {
      query.role = filters.role;
    }

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    return query;
  }
}
