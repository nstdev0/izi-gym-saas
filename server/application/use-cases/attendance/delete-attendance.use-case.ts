import { IAttendanceRepository } from "@/server/application/repositories/attendance.repository.interface";

export interface IDeleteAttendanceUseCase {
    execute(id: string): Promise<void>;
}

export class DeleteAttendanceUseCase implements IDeleteAttendanceUseCase {
    constructor(private readonly repository: IAttendanceRepository) { }

    async execute(id: string): Promise<void> {
        return this.repository.delete(id);
    }
}
