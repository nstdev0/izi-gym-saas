import { IAttendanceRepository } from "@/server/application/repositories/attendance.repository.interface";
import { IPermissionService } from "@/server/application/services/permission.service.interface";

export class DeleteAttendanceUseCase {
    constructor(
        private readonly repository: IAttendanceRepository,
        private readonly permissions: IPermissionService
    ) { }

    async execute(id: string): Promise<void> {
        this.permissions.require('attendance:delete');
        await this.repository.delete(id);
    }
}

export type IDeleteAttendanceUseCase = InstanceType<typeof DeleteAttendanceUseCase>
