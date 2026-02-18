import { IAttendanceRepository } from "@/server/application/repositories/attendance.repository.interface";
import { Attendance } from "@/server/domain/entities/Attendance";
import { IPermissionService } from "@/server/application/services/permission.service.interface";

export class GetAttendanceByIdUseCase {
    constructor(
        private readonly repository: IAttendanceRepository,
        private readonly permissions: IPermissionService
    ) { }

    async execute(id: string): Promise<Attendance | null> {
        this.permissions.require('attendance:read');
        return this.repository.findById(id);
    }
}

export type IGetAttendanceByIdUseCase = InstanceType<typeof GetAttendanceByIdUseCase>
