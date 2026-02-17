import { AttendanceFilters } from "@/server/application/repositories/attendance.repository.interface";
import { IGetAllAttendancesUseCase } from "@/server/application/use-cases/attendance/get-all-attendances.use-case";
import { Attendance } from "@/server/domain/entities/Attendance";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { PageableRequest, PageableResponse } from "@/shared/common/pagination";

export class GetAllAttendancesController implements ControllerExecutor<PageableRequest<AttendanceFilters>, PageableResponse<Attendance>> {
    constructor(private readonly useCase: IGetAllAttendancesUseCase) { }

    async execute(request: PageableRequest<AttendanceFilters>) {
        return await this.useCase.execute(request);
    }
}
