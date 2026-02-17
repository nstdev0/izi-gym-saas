import { RegisterAttendanceUseCase } from "@/server/application/use-cases/attendance/register-attendance.use-case";
import { RegisterAttendanceInput } from "@/server/application/dtos/attendance.dto";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class RegisterAttendanceController implements ControllerExecutor<RegisterAttendanceInput, void> {
    constructor(private readonly useCase: RegisterAttendanceUseCase) { }

    async execute(input: RegisterAttendanceInput): Promise<void> {
        await this.useCase.execute(input);
    }
}
