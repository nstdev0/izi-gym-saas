import { PageableRequest, PageableResponse } from "@/shared/common/pagination";
import { IAttendanceRepository, AttendanceFilters } from "@/server/application/repositories/attendance.repository.interface";
import { Attendance } from "@/server/domain/entities/Attendance";
import { IPermissionService } from "@/server/application/services/permission.service.interface";

export class GetAllAttendancesUseCase {
    constructor(
        private readonly repository: IAttendanceRepository,
        private readonly permissions: IPermissionService
    ) { }

    async execute(
        request: PageableRequest<AttendanceFilters>,
    ): Promise<PageableResponse<Attendance>> {
        this.permissions.require('attendance:read');
        return await this.repository.findAll(request);
    }
}

export type IGetAllAttendancesUseCase = InstanceType<typeof GetAllAttendancesUseCase>;
