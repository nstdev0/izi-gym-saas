import { IAttendanceRepository, AttendanceWithMember } from "@/server/application/repositories/attendance.repository.interface";
import { UpdateAttendanceInput } from "@/server/application/dtos/attendance.dto";

export interface IUpdateAttendanceUseCase {
    execute(id: string, data: UpdateAttendanceInput): Promise<AttendanceWithMember>;
}

export class UpdateAttendanceUseCase implements IUpdateAttendanceUseCase {
    constructor(private readonly repository: IAttendanceRepository) { }

    async execute(id: string, data: UpdateAttendanceInput): Promise<AttendanceWithMember> {
        return this.repository.update(id, data);
    }
}
