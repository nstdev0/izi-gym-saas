import { RegisterAttendanceInput, UpdateAttendanceInput } from "@/server/application/dtos/attendance.dto";
import { IBaseRepository } from "./base.repository.interface";
import { Attendance } from "@/server/domain/entities/Attendance";

export interface AttendanceFilters {
    search?: string;
    sort?: string;
    method?: string;
}

export interface IAttendanceRepository extends IBaseRepository<Attendance, RegisterAttendanceInput, UpdateAttendanceInput, AttendanceFilters> {
    findById(id: string): Promise<Attendance | null>;
}


