import { CreateMemberSchema } from "@/server/application/dtos/members.dto";
import { MembersFilters } from "@/server/application/repositories/members.repository.interface";
import { createContext } from "@/server/lib/api-handler";
import { PageableRequest } from "@/server/shared/common/pagination";
import { parsePagination } from "@/server/shared/utils/pagination-parser";

export const GET = createContext(
  (c) => c.getAllMembersController,
  async (req): Promise<PageableRequest<MembersFilters>> => {
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
  (c) => c.createMemberController,
  async (req) => {
    const body = await req.json();
    return CreateMemberSchema.parse(body);
  }
);