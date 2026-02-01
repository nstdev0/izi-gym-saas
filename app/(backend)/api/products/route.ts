import { createContext } from "@/server/lib/api-handler";
import { PageableRequest } from "@/server/shared/common/pagination";
import { ProductsFilters } from "@/server/application/repositories/products.repository.interface";

export const GET = createContext(
  (container) => container.getAllProductsController,
  async (req): Promise<PageableRequest<ProductsFilters>> => {
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
  (container) => container.createProductController,
  async (req) => await req.json(),
);
