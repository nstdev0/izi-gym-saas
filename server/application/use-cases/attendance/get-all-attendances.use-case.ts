import {
    PageableRequest,
    PageableResponse,
} from "@/shared/common/pagination";
import {
    IAttendanceRepository,
    AttendanceFilters,
} from "@/server/application/repositories/attendance.repository.interface";
import { Attendance } from "@/server/domain/entities/Attendance";

export class GetAllAttendancesUseCase {
    constructor(private readonly repository: IAttendanceRepository) { }

    async execute(
        request: PageableRequest<AttendanceFilters>,
    ): Promise<PageableResponse<Attendance>> {
        return await this.repository.findAll(request);
    }
}

export type IGetAllAttendancesUseCase = InstanceType<typeof GetAllAttendancesUseCase>;
