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
        status: status || undefined
      },
    };
  },
);

export const POST = createContext(
  // 1. Seleccionamos el Controller
  (c) => c.createMemberController,

  // 2. MAPPER: Aquí ocurre la VALIDACIÓN (El filtro de seguridad)
  async (req) => {
    const body = await req.json();

    // Si esto falla, Zod lanza error y el api-handler devuelve 400.
    // El controller NUNCA se ejecuta si esto falla.
    return CreateMemberSchema.parse(body);
  }
);