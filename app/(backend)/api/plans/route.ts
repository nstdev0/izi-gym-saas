import { createPlanSchema, UpdatePlanSchema } from "@/server/application/dtos/plans.dto";
import { PlansFilters } from "@/server/application/repositories/plans.repository.interface";
import { createContext } from "@/server/lib/api-handler";
import { PageableRequest } from "@/server/shared/common/pagination";
import { parsePagination } from "@/server/shared/utils/pagination-parser";

export const GET = createContext(
  (c) => c.getAllPlansController,
  async (req): Promise<PageableRequest<PlansFilters>> => {
    const { page, limit } = parsePagination(req);
    const { search } = Object.fromEntries(req.nextUrl.searchParams.entries());
    return {
      page,
      limit,
      filters: {
        search: search || undefined,
      },
    };
  }
);

export const POST = createContext(
  (c) => c.createPlanController,
  async (req) => {
    const body = await req.json();
    return createPlanSchema.parse(body);
  }
);
