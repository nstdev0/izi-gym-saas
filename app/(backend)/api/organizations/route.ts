import { createOrganizationSchema } from "@/shared/types/organizations.types";
import { OrganizationsFilters } from "@/server/application/repositories/organizations.repository.interface";
import { createContext } from "@/server/lib/api-handler";
import { PageableRequest } from "@/shared/types/pagination.types";
import { parsePagination } from "@/shared/utils/pagination-parser";
import { auth } from "@clerk/nextjs/server";

export const GET = createContext(
  (c) => c.getAllOrganizationsController,
  async (req): Promise<PageableRequest<OrganizationsFilters>> => {
    const { page, limit } = parsePagination(req);
    const { search, sort, status } = Object.fromEntries(req.nextUrl.searchParams.entries());
    return {
      page,
      limit,
      filters: {
        search: search || undefined,
        sort: sort || undefined,
        status: status || undefined,
      },
    };
  },
);

export const POST = createContext(
  (c) => c.createOrganizationController,
  async (req) => {
    const body = await req.json();
    const validated = createOrganizationSchema.parse(body);

    const { userId } = await auth();
    if (!userId) throw new Error("No autenticado");

    return { ...validated, userId };
  }
);

