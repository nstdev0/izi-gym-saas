import { UpdateAttendanceInput } from "@/server/application/dtos/attendance.dto";
import { IUpdateAttendanceUseCase } from "@/server/application/use-cases/attendance/update-attendance.use-case";
import { BadRequestError } from "@/server/domain/errors/common";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class UpdateAttendanceController implements ControllerExecutor<UpdateAttendanceInput, void> {
    constructor(private readonly useCase: IUpdateAttendanceUseCase) { }

    async execute(input: UpdateAttendanceInput, id?: string) {
        if (!id) {
            throw new BadRequestError("No se proporcionó un id");
        }
        await this.useCase.execute(id, input);
    }
}
