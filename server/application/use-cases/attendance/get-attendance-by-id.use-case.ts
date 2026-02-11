import { IAttendanceRepository, AttendanceWithMember } from "@/server/application/repositories/attendance.repository.interface";

export interface IGetAttendanceByIdUseCase {
    execute(id: string): Promise<AttendanceWithMember | null>;
}

export class GetAttendanceByIdUseCase implements IGetAttendanceByIdUseCase {
    constructor(private readonly repository: IAttendanceRepository) { }

    async execute(id: string): Promise<AttendanceWithMember | null> {
        return this.repository.findById(id);
    }
}
