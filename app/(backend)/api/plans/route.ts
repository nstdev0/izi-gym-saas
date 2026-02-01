import { PlansFilters } from "@/server/application/repositories/plans.repository.interface";
import { createContext } from "@/server/lib/api-handler";
import { PageableRequest } from "@/server/shared/common/pagination";

export const GET = createContext(
  (container) => container.getAllPlansController,
  async (req): Promise<PageableRequest<PlansFilters>> => {
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

export const POST = createContext(
  (container) => container.createPlanController,
  async (req) => req,
);
