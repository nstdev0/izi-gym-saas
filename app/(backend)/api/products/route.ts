import { createContext } from "@/server/lib/api-handler";
import { PageableRequest } from "@/server/shared/common/pagination";
import { ProductsFilters } from "@/server/application/repositories/products.repository.interface";
import { parsePagination } from "@/server/shared/utils/pagination-parser";
import { createProductSchema } from "@/server/application/dtos/products.dto";

export const GET = createContext(
  (container) => container.getAllProductsController,
  async (req): Promise<PageableRequest<ProductsFilters>> => {
    const { page, limit } = parsePagination(req);
    const { search, sort, type, status } = Object.fromEntries(req.nextUrl.searchParams.entries());
    return {
      page,
      limit,
      filters: {
        search: search || undefined,
        sort: sort || undefined,
        type: type || undefined,
        status: status || undefined,
      },
    };
  },
);

export const POST = createContext(
  (container) => container.createProductController,
  async (req) => {
    const body = await req.json();
    return createProductSchema.parse(body);
  },
);
