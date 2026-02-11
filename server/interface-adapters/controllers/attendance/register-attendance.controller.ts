import { RegisterAttendanceUseCase } from "@/server/application/use-cases/attendance/register-attendance.use-case";
import { RegisterAttendanceInput } from "@/server/application/dtos/attendance.dto";

export class RegisterAttendanceController {
    constructor(private readonly useCase: RegisterAttendanceUseCase) { }

    async execute(input: RegisterAttendanceInput) {
        return this.useCase.execute(input);
    }
}
