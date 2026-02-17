import { createMembershipSchema } from "@/shared/types/memberships.types";
import { MembershipsFilters } from "@/shared/types/memberships.types";
import { createContext } from "@/server/lib/api-handler";
import { PageableRequest } from "@/shared/types/pagination.types";
import { parsePagination } from "@/shared/utils/pagination-parser";

export const GET = createContext(
  (c) => c.getAllMembershipsController,
  async (req): Promise<PageableRequest<MembershipsFilters>> => {
    const { page, limit } = parsePagination(req);
    const { search, sort, status } = Object.fromEntries(req.nextUrl.searchParams.entries());
    return {
      page,
      limit,
      filters: {
        search: search || undefined,
        sort: sort || undefined,
        status: status || undefined,
      }
    };
  }
);

export const POST = createContext(
  (c) => c.createMembershipController,
  async (req) => {
    const body = await req.json();
    return createMembershipSchema.parse(body);
  }
);
