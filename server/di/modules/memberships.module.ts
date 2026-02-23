import { MembershipsRepository } from "@/server/infrastructure/persistence/repositories/memberships.repository";
import { GetAllMembershipsUseCase } from "@/server/application/use-cases/memberships/get-all-memberships.use-case";
import { CreateMembershipUseCase } from "@/server/application/use-cases/memberships/create-membership.use-case";
import { GetMembershipByIdUseCase } from "@/server/application/use-cases/memberships/get-membership-by-id.use-case";
import { UpdateMembershipUseCase } from "@/server/application/use-cases/memberships/update-membership.use-case";
import { DeleteMembershipUseCase } from "@/server/application/use-cases/memberships/delete-membership.use-case";
import { RestoreMembershipUseCase } from "@/server/application/use-cases/memberships/restore-membership.use-case";
import { CancelMembershipUseCase } from "@/server/application/use-cases/memberships/cancel-membership.use-case";

import { GetAllMembershipsController } from "@/server/interface-adapters/controllers/memberships/get-all-memberships.controller";
import { CreateMembershipController } from "@/server/interface-adapters/controllers/memberships/create-membership.controller";
import { GetMembershipByIdController } from "@/server/interface-adapters/controllers/memberships/get-membership-by-id.controller";
import { UpdateMembershipController } from "@/server/interface-adapters/controllers/memberships/update-membership.controller";
import { DeleteMembershipController } from "@/server/interface-adapters/controllers/memberships/delete-membership.controller";
import { RestoreMembershipController } from "@/server/interface-adapters/controllers/memberships/restore-membership.controller";
import { CancelMembershipController } from "@/server/interface-adapters/controllers/memberships/cancel-membership.controller";
import { PrismaClient } from "@/generated/prisma/client";
import type { AuthModule } from "@/server/di/modules/auth.module";
import { PrismaUnitOfWork } from "@/server/infrastructure/persistence/prisma-unit-of-work";

export function createMembershipsModule(prisma: PrismaClient, tenantId: string, authModule: AuthModule) {
    const membershipsRepository = new MembershipsRepository(
        prisma.membership,
        tenantId,
    );

    const unitOfWork = new PrismaUnitOfWork(prisma);

    const getAllMembershipsUseCase = new GetAllMembershipsUseCase(
        membershipsRepository,
        authModule.permissionService,
    );
    const createMembershipUseCase = new CreateMembershipUseCase(
        membershipsRepository,
        authModule.permissionService,
        unitOfWork,
        tenantId,
    );
    const getMembershipByIdUseCase = new GetMembershipByIdUseCase(
        membershipsRepository,
        authModule.permissionService,
    );
    const updateMembershipUseCase = new UpdateMembershipUseCase(
        membershipsRepository,
        authModule.permissionService,
    );
    const deleteMembershipUseCase = new DeleteMembershipUseCase(
        authModule.permissionService,
        unitOfWork,
        tenantId,
    );
    const restoreMembershipUseCase = new RestoreMembershipUseCase(
        authModule.permissionService,
        unitOfWork,
        tenantId,
    );
    const cancelMembershipUseCase = new CancelMembershipUseCase(
        authModule.permissionService,
        unitOfWork,
        tenantId,
    );

    const getAllMembershipsController = new GetAllMembershipsController(
        getAllMembershipsUseCase,
    );
    const createMembershipController = new CreateMembershipController(
        createMembershipUseCase,
    );
    const getMembershipByIdController = new GetMembershipByIdController(
        getMembershipByIdUseCase,
    );
    const updateMembershipController = new UpdateMembershipController(
        updateMembershipUseCase,
    );
    const deleteMembershipController = new DeleteMembershipController(
        deleteMembershipUseCase,
    );
    const restoreMembershipController = new RestoreMembershipController(
        restoreMembershipUseCase,
    );
    const cancelMembershipController = new CancelMembershipController(
        cancelMembershipUseCase,
    );

    return {
        getAllMembershipsController,
        createMembershipController,
        getMembershipByIdController,
        updateMembershipController,
        deleteMembershipController,
        restoreMembershipController,
        cancelMembershipController,
    };
}
