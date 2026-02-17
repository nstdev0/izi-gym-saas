import { UsersFilters } from "@/server/application/repositories/users.repository.interface";
import { createContext } from "@/server/lib/api-handler";
import { PageableRequest } from "@/shared/types/pagination.types";
import { parsePagination } from "@/shared/utils/pagination-parser";

export const GET = createContext(
  (container) => container.getAllUsersController,
  async (req): Promise<PageableRequest<UsersFilters>> => {
    const { page, limit } = parsePagination(req);
    const { search, sort, role, status } = Object.fromEntries(req.nextUrl.searchParams.entries());
    return {
      page,
      limit,
      filters: {
        search: search || undefined,
        sort: sort || undefined,
        role: role || undefined,
        status: status || undefined,
      },
    };
  },
);

import { CreateUserSchema } from "@/shared/types/users.types";

export const POST = createContext(
  (container) => container.createUserController,
  async (req) => {
    const body = await req.json();
    return CreateUserSchema.parse(body);
  },
);
