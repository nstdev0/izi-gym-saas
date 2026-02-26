import { IGetAllAttendancesUseCase } from "@/server/application/use-cases/attendance/get-all-attendances.use-case";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { PageableRequest, PageableResponse } from "@/shared/types/pagination.types";
import { Attendance, AttendanceFilters } from "@/shared/types/attendance.types";

export class GetAllAttendancesController implements ControllerExecutor<PageableRequest<AttendanceFilters>, PageableResponse<Attendance>> {
    constructor(private readonly useCase: IGetAllAttendancesUseCase) { }

    async execute(request: PageableRequest<AttendanceFilters>) {
        return await this.useCase.execute(request);
    }
}
