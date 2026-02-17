import { IAttendanceRepository } from "@/server/application/repositories/attendance.repository.interface";

export class DeleteAttendanceUseCase {
    constructor(private readonly repository: IAttendanceRepository) { }

    async execute(id: string): Promise<void> {
        await this.repository.delete(id);
    }
}

export type IDeleteAttendanceUseCase = InstanceType<typeof DeleteAttendanceUseCase>
