import { CreateMemberSchema } from "@/shared/types/members.types";
import { MembersFilters } from "@/shared/types/members.types";
import { createContext } from "@/server/lib/api-handler";
import { PageableRequest } from "@/shared/types/pagination.types";
import { parsePagination } from "@/shared/utils/pagination-parser";

export const GET = createContext(
  (c) => c.getAllMembersController,
  async (req): Promise<PageableRequest<MembersFilters>> => {
    const { page, limit } = parsePagination(req);
    const { search, sort, status, gender } = Object.fromEntries(req.nextUrl.searchParams.entries());
    return {
      page,
      limit,
      filters: {
        search: search || undefined,
        sort: sort || undefined,
        status: status || undefined,
        gender: gender || undefined,
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