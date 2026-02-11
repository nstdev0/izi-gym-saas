import { IDeleteAttendanceUseCase } from "@/server/application/use-cases/attendance/delete-attendance.use-case";
import { BadRequestError } from "@/server/domain/errors/common";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class DeleteAttendanceController implements ControllerExecutor<void, void> {
    constructor(private readonly useCase: IDeleteAttendanceUseCase) { }

    async execute(_input: void, id?: string) {
        if (!id) {
            throw new BadRequestError("No se proporcionó un id");
        }
        await this.useCase.execute(id);
    }
}
