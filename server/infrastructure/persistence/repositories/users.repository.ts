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
  implements IUsersRepository
{
  protected async buildQueryFilters(
    filters: UsersFilters,
  ): Promise<Prisma.UserWhereInput> {
    const query: Prisma.UserWhereInput = {};

    if (filters.search) {
      const searchTerms = filters.search.trim().split(/\s+/).filter(Boolean);
      if (searchTerms.length > 0) {
        query.AND = searchTerms.map((term) => ({
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { email: { contains: term, mode: "insensitive" } },
          ],
        }));
      }
    }

    if (filters.role) {
      query.role = filters.role;
    }

    return query;
  }
}
