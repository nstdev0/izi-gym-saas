import { RegisterAttendanceInput } from "@/server/application/dtos/attendance.dto";
import { NotFoundError, ValidationError } from "@/server/domain/errors/common";
import { IAttendanceRepository } from "@/server/application/repositories/attendance.repository.interface";
import { IMembersRepository } from "@/server/application/repositories/members.repository.interface";
import { IPermissionService } from "@/server/application/services/permission.service.interface";

export class RegisterAttendanceUseCase {
    constructor(
        private readonly attendanceRepository: IAttendanceRepository,
        private readonly membersRepository: IMembersRepository,
        private readonly permissions: IPermissionService,
    ) { }

    async execute(input: RegisterAttendanceInput): Promise<void> {
        this.permissions.require('attendance:create');
        const member = await this.membersRepository.findUnique({ id: input.memberId });

        if (!member) {
            throw new NotFoundError("Miembro no encontrado");
        }

        if (!member.isActive) {
            throw new ValidationError("Miembro no activo");
        }

        await this.attendanceRepository.create(input);
    }
}

export type IRegisterAttendanceUseCase = InstanceType<typeof RegisterAttendanceUseCase>
