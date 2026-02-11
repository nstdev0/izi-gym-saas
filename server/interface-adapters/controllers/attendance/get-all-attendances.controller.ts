import { AttendanceFilters, AttendanceWithMember } from "@/server/application/repositories/attendance.repository.interface";
import { IGetAllAttendancesUseCase } from "@/server/application/use-cases/attendance/get-all-attendances.use-case";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { PageableRequest, PageableResponse } from "@/server/shared/common/pagination";

export class GetAllAttendancesController implements ControllerExecutor<PageableRequest<AttendanceFilters>, PageableResponse<AttendanceWithMember>> {
    constructor(private readonly useCase: IGetAllAttendancesUseCase) { }

    async execute(request: PageableRequest<AttendanceFilters>) {
        return await this.useCase.execute(request);
    }
}
