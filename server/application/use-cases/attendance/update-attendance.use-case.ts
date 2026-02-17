import { IAttendanceRepository } from "@/server/application/repositories/attendance.repository.interface";
import { UpdateAttendanceInput } from "@/server/application/dtos/attendance.dto";

export class UpdateAttendanceUseCase {
    constructor(private readonly repository: IAttendanceRepository) { }

    async execute(id: string, data: UpdateAttendanceInput): Promise<void> {
        await this.repository.update(id, data);
    }
}

export type IUpdateAttendanceUseCase = InstanceType<typeof UpdateAttendanceUseCase>
