import { IAttendanceRepository } from "@/server/application/repositories/attendance.repository.interface";
import { UpdateAttendanceInput } from "@/server/application/dtos/attendance.dto";
import { IPermissionService } from "@/server/application/services/permission.service.interface";

export class UpdateAttendanceUseCase {
    constructor(
        private readonly repository: IAttendanceRepository,
        private readonly permissions: IPermissionService
    ) { }

    async execute(id: string, data: UpdateAttendanceInput): Promise<void> {
        this.permissions.require('attendance:update');
        await this.repository.update(id, data);
    }
}

export type IUpdateAttendanceUseCase = InstanceType<typeof UpdateAttendanceUseCase>
