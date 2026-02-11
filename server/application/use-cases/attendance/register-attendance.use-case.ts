import { IAttendanceRepository } from "@/server/application/repositories/attendance.repository.interface";
import { RegisterAttendanceInput } from "@/server/application/dtos/attendance.dto";
import { IMembersRepository } from "@/server/application/repositories/members.repository.interface";
import { NotFoundError, ValidationError } from "@/server/domain/errors/common";

export class RegisterAttendanceUseCase {
    constructor(
        private readonly attendanceRepository: IAttendanceRepository,
        private readonly membersRepository: IMembersRepository
    ) { }

    async execute(input: RegisterAttendanceInput) {
        // 1. Validate Member exists and is active
        const member = await this.membersRepository.findUnique({ id: input.memberId });

        if (!member) {
            throw new NotFoundError("Member not found");
        }

        if (!member.isActive) {
            throw new ValidationError("Member is not active");
        }

        // 2. Register Attendance
        return this.attendanceRepository.create(input);
    }
}
