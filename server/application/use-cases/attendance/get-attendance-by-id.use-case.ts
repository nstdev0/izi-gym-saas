import { IAttendanceRepository } from "@/server/application/repositories/attendance.repository.interface";
import { Attendance } from "@/server/domain/entities/Attendance";

export class GetAttendanceByIdUseCase {
    constructor(private readonly repository: IAttendanceRepository) { }

    async execute(id: string): Promise<Attendance | null> {
        return this.repository.findById(id);
    }
}

export type IGetAttendanceByIdUseCase = InstanceType<typeof GetAttendanceByIdUseCase>
