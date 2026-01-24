import { MembersFilters } from "@/server/application/repositories/members.repository.interface";
import { createContext } from "@/server/lib/middleware";
import { PageableRequest } from "@/server/shared/common/pagination";

// Get All Members Paginated
// route.ts
export const GET = createContext(
  (container) => container.getAllMembersController,
  async (req): Promise<PageableRequest<MembersFilters>> => {
    const { searchParams } = req.nextUrl;
    return {
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 10,
      filters: {
        search: searchParams.get("query") || undefined,
      },
    };
  },
);

// Create Member
export const POST = createContext(
  (container) => container.createMemberController,
  async (req) => await req.json(),
);
