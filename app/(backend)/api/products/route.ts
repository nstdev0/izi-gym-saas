import { createContext } from "@/server/lib/api-handler";
import { PageableRequest } from "@/shared/types/pagination.types";
import { ProductsFilters } from "@/server/application/repositories/products.repository.interface";
import { parsePagination } from "@/shared/utils/pagination-parser";
import { createProductSchema } from "@/shared/types/products.types";

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
