import { IGetAttendanceByIdUseCase } from "@/server/application/use-cases/attendance/get-attendance-by-id.use-case";
import { AttendanceWithMember } from "@/server/application/repositories/attendance.repository.interface";
import { BadRequestError, NotFoundError } from "@/server/domain/errors/common";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class GetAttendanceByIdController implements ControllerExecutor<void, AttendanceWithMember | null> {
    constructor(private readonly useCase: IGetAttendanceByIdUseCase) { }

    async execute(_input: void, id?: string) {
        if (!id) {
            throw new BadRequestError("No se proporcionó un id");
        }
        const attendance = await this.useCase.execute(id);

        if (!attendance) {
            throw new NotFoundError("Asistencia no encontrada");
        }

        return attendance;
    }
}
