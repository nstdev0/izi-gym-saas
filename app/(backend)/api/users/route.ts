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
        search: searchParams.get("query") || undefined,
        role: (searchParams.get("role") as Role) || undefined,
        isActive: searchParams.get("isActive") === "true",
      },
    };
  },
);

export const POST = createContext(
  (container) => container.createUserController,
  async (req) => await req.json(),
);
