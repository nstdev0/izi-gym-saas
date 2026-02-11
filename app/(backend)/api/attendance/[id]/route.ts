import { UpdateAttendanceSchema } from "@/server/application/dtos/attendance.dto";
import { createContext } from "@/server/lib/api-handler";

export const GET = createContext(
    (c) => c.getAttendanceByIdController
);

export const PATCH = createContext(
    (c) => c.updateAttendanceController,
    async (req) => {
        const body = await req.json();
        return UpdateAttendanceSchema.parse(body);
    }
);

export const DELETE = createContext(
    (c) => c.deleteAttendanceController
);

