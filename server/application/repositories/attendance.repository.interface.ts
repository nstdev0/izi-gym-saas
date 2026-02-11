import { RegisterAttendanceInput } from "@/server/application/dtos/attendance.dto";
import { Attendance } from "@/generated/prisma/client";
import { PageableRequest, PageableResponse } from "@/server/shared/common/pagination";

export interface AttendanceFilters {
    search?: string;
    sort?: string;
    method?: string;
}

export interface AttendanceWithMember extends Attendance {
    member: {
        id: string;
        firstName: string;
        lastName: string;
        image: string | null;
    };
}

export interface IAttendanceRepository {
    findAll(request: PageableRequest<AttendanceFilters>): Promise<PageableResponse<AttendanceWithMember>>;
    create(data: RegisterAttendanceInput): Promise<Attendance>;
}

