import { UsersFilters } from "@/server/application/repositories/users.repository.interface";
import { createContext } from "@/server/lib/api-handler";
import { PageableRequest } from "@/server/shared/common/pagination";
import { Role } from "@/generated/prisma/client";

export const GET = createContext(
  (container) => container.getAllUsersController,
  async (req): Promise<PageableRequest<UsersFilters>> => {
    const { searchParams } = req.nextUrl;
    return {
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 10,
      filters: {
        search: searchParams.get("search") || undefined,
        sort: searchParams.get("sort") || undefined,
        role: searchParams.get("role") || undefined,
        status: searchParams.get("status") || undefined
      },
    };
  },
);

import { CreateUserSchema } from "@/server/application/dtos/users.dto";

export const POST = createContext(
  (container) => container.createUserController,
  async (req) => {
    const body = await req.json();
    return CreateUserSchema.parse(body);
  },
);
