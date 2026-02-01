import { MembershipsFilters } from "@/server/application/repositories/memberships.repository.interface";
import { createContext } from "@/server/lib/api-handler";
import { PageableRequest } from "@/server/shared/common/pagination";

export const GET = createContext(
  (container) => container.getAllMembershipsController,
  async (req): Promise<PageableRequest<MembershipsFilters>> => {
    const { searchParams } = req.nextUrl;
    return {
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 10,
      filters: {
        status: (searchParams.get("status") as any) || undefined,
        memberId: searchParams.get("memberId") || undefined,
        planId: searchParams.get("planId") || undefined,
      },
    };
  },
);

export const POST = createContext(
  (container) => container.createMembershipController,
  async (req) => await req.json(),
);
