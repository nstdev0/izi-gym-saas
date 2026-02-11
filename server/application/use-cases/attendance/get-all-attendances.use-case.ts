import {
    PageableRequest,
    PageableResponse,
} from "@/server/shared/common/pagination";
import {
    IAttendanceRepository,
    AttendanceFilters,
    AttendanceWithMember,
} from "@/server/application/repositories/attendance.repository.interface";

export class GetAllAttendancesUseCase {
    constructor(private readonly repository: IAttendanceRepository) { }

    async execute(
        request: PageableRequest<AttendanceFilters>,
    ): Promise<PageableResponse<AttendanceWithMember>> {
        return await this.repository.findAll(request);
    }
}

export type IGetAllAttendancesUseCase = InstanceType<typeof GetAllAttendancesUseCase>;
