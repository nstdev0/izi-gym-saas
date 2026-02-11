import { RegisterAttendanceSchema } from "@/server/application/dtos/attendance.dto";
import { AttendanceFilters } from "@/server/application/repositories/attendance.repository.interface";
import { createContext } from "@/server/lib/api-handler";
import { PageableRequest } from "@/server/shared/common/pagination";
import { parsePagination } from "@/server/shared/utils/pagination-parser";

export const GET = createContext(
    (c) => c.getAllAttendancesController,
    async (req): Promise<PageableRequest<AttendanceFilters>> => {
        const { page, limit } = parsePagination(req);
        const { search, sort, method } = Object.fromEntries(req.nextUrl.searchParams.entries());
        return {
            page,
            limit,
            filters: {
                search: search || undefined,
                sort: sort || undefined,
                method: method || undefined,
            },
        };
    },
);

export const POST = createContext(
    (c) => c.registerAttendanceController,
    async (req) => {
        const body = await req.json();
        return RegisterAttendanceSchema.parse(body);
    }
);
