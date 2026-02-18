import { AttendanceRepository } from "@/server/infrastructure/persistence/repositories/attendance.repository";
import { MembersRepository } from "@/server/infrastructure/persistence/repositories/members.repository";
import { RegisterAttendanceUseCase } from "@/server/application/use-cases/attendance/register-attendance.use-case";
import { GetAllAttendancesUseCase } from "@/server/application/use-cases/attendance/get-all-attendances.use-case";
import { GetAttendanceByIdUseCase } from "@/server/application/use-cases/attendance/get-attendance-by-id.use-case";
import { UpdateAttendanceUseCase } from "@/server/application/use-cases/attendance/update-attendance.use-case";
import { DeleteAttendanceUseCase } from "@/server/application/use-cases/attendance/delete-attendance.use-case";

import { RegisterAttendanceController } from "@/server/interface-adapters/controllers/attendance/register-attendance.controller";
import { GetAllAttendancesController } from "@/server/interface-adapters/controllers/attendance/get-all-attendances.controller";
import { GetAttendanceByIdController } from "@/server/interface-adapters/controllers/attendance/get-attendance-by-id.controller";
import { UpdateAttendanceController } from "@/server/interface-adapters/controllers/attendance/update-attendance.controller";
import { DeleteAttendanceController } from "@/server/interface-adapters/controllers/attendance/delete-attendance.controller";
import { PrismaClient } from "@/generated/prisma/client";
import type { AuthModule } from "@/server/di/modules/auth.module";

export function createAttendanceModule(prisma: PrismaClient, tenantId: string, authModule: AuthModule) {
    const attendanceRepository = new AttendanceRepository(prisma.attendance, tenantId);
    const membersRepository = new MembersRepository(prisma.member, tenantId);

    const registerAttendanceUseCase = new RegisterAttendanceUseCase(attendanceRepository, membersRepository, authModule.permissionService);
    const getAllAttendancesUseCase = new GetAllAttendancesUseCase(attendanceRepository, authModule.permissionService);
    const getAttendanceByIdUseCase = new GetAttendanceByIdUseCase(attendanceRepository, authModule.permissionService);
    const updateAttendanceUseCase = new UpdateAttendanceUseCase(attendanceRepository, authModule.permissionService);
    const deleteAttendanceUseCase = new DeleteAttendanceUseCase(attendanceRepository, authModule.permissionService);

    const registerAttendanceController = new RegisterAttendanceController(registerAttendanceUseCase);
    const getAllAttendancesController = new GetAllAttendancesController(getAllAttendancesUseCase);
    const getAttendanceByIdController = new GetAttendanceByIdController(getAttendanceByIdUseCase);
    const updateAttendanceController = new UpdateAttendanceController(updateAttendanceUseCase);
    const deleteAttendanceController = new DeleteAttendanceController(deleteAttendanceUseCase);

    return {
        registerAttendanceController,
        getAllAttendancesController,
        getAttendanceByIdController,
        updateAttendanceController,
        deleteAttendanceController,
    };
}
