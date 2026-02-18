import { MembersRepository } from "@/server/infrastructure/persistence/repositories/members.repository";
import { GetAllMembersUseCase } from "@/server/application/use-cases/members/get-all-members.use-case";
import { CreateMemberUseCase } from "@/server/application/use-cases/members/create-member.use-case";
import { GetMemberByIdUseCase } from "@/server/application/use-cases/members/get-member-by-id.use-case";
import { UpdateMemberUseCase } from "@/server/application/use-cases/members/update-member.use-case";
import { DeleteMemberUseCase } from "@/server/application/use-cases/members/delete-member.use-case";
import { RestoreMemberUseCase } from "@/server/application/use-cases/members/restore-member.use-case";
import { GetMemberByQrCodeUseCase } from "@/server/application/use-cases/members/get-member-by-qr.use-case";

import { GetAllMembersController } from "@/server/interface-adapters/controllers/members/get-all-members.controller";
import { CreateMemberController } from "@/server/interface-adapters/controllers/members/create-member.controller";
import { GetMemberByIdController } from "@/server/interface-adapters/controllers/members/get-member-by-id.controller";
import { UpdateMemberController } from "@/server/interface-adapters/controllers/members/update-member.controller";
import { DeleteMemberController } from "@/server/interface-adapters/controllers/members/delete-member.controller";
import { RestoreMemberController } from "@/server/interface-adapters/controllers/members/restore-member.controller";
import { GetMemberByQrCodeController } from "@/server/interface-adapters/controllers/members/get-member-by-qr-code.controller";
import { PrismaClient } from "@/generated/prisma/client";
import { IMCCalculator } from "@/server/infrastructure/services/imc-calculator.service";
import type { AuthModule } from "@/server/di/modules/auth.module";

export function createMembersModule(prisma: PrismaClient, tenantId: string, authModule: AuthModule) {
    const membersRepository = new MembersRepository(prisma.member, tenantId);
    const imcCalculator = new IMCCalculator();

    const getAllMembersUseCase = new GetAllMembersUseCase(membersRepository, authModule.permissionService);
    const createMemberUseCase = new CreateMemberUseCase(membersRepository, imcCalculator, authModule.permissionService, authModule.entitlementService);
    const getMemberByIdUseCase = new GetMemberByIdUseCase(membersRepository, authModule.permissionService);
    const updateMemberUseCase = new UpdateMemberUseCase(membersRepository, imcCalculator, authModule.permissionService);
    const deleteMemberUseCase = new DeleteMemberUseCase(membersRepository, authModule.permissionService);
    const restoreMemberUseCase = new RestoreMemberUseCase(membersRepository, authModule.permissionService);
    const getMemberByQrCodeUseCase = new GetMemberByQrCodeUseCase(membersRepository, authModule.permissionService);

    const getAllMembersController = new GetAllMembersController(
        getAllMembersUseCase,
    );
    const createMemberController = new CreateMemberController(
        createMemberUseCase,
    );
    const getMemberByIdController = new GetMemberByIdController(
        getMemberByIdUseCase,
    );
    const updateMemberController = new UpdateMemberController(
        updateMemberUseCase,
    );
    const deleteMemberController = new DeleteMemberController(
        deleteMemberUseCase,
    );
    const restoreMemberController = new RestoreMemberController(
        restoreMemberUseCase,
    );
    const getMemberByQrCodeController = new GetMemberByQrCodeController(
        getMemberByQrCodeUseCase,
    );

    return {
        getAllMembersController,
        createMemberController,
        getMemberByIdController,
        updateMemberController,
        deleteMemberController,
        restoreMemberController,
        getMemberByQrCodeController,
        membersRepository,
    };
}
