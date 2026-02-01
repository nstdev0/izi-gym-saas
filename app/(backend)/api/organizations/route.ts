import { OrganizationsFilters } from "@/server/application/repositories/organizations.repository.interface";
import { createContext } from "@/server/lib/api-handler";
import { PageableRequest } from "@/server/shared/common/pagination";

export const GET = createContext(
  (container) => container.getAllOrganizationsController,
  async (req): Promise<PageableRequest<OrganizationsFilters>> => {
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
  (container) => container.createOrganizationController,
  async (req) => req, // Pasamos el req completo porque el controller lo espera (handle(req: NextRequest))
);
