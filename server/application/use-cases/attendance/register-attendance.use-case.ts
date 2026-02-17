import { RegisterAttendanceInput } from "@/server/application/dtos/attendance.dto";
import { NotFoundError, ValidationError } from "@/server/domain/errors/common";
import { PrismaClient } from "@/generated/prisma/client";

export class RegisterAttendanceUseCase {
    constructor(
        private readonly prisma: PrismaClient,
    ) { }

    async execute(input: RegisterAttendanceInput): Promise<void> {
        const member = await this.prisma.member.findUnique({ where: { id: input.memberId } });

        if (!member) {
            throw new NotFoundError("Miembro no encontrado");
        }

        if (!member.isActive) {
            throw new ValidationError("Miembro no activo");
        }

        await this.prisma.attendance.create({ data: { ...input, organizationId: member.organizationId } });
    }
}

export type IRegisterAttendanceUseCase = InstanceType<typeof RegisterAttendanceUseCase>
