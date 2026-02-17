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

export function createMembershipsModule(prisma: PrismaClient, tenantId: string) {
    const membershipsRepository = new MembershipsRepository(
        prisma.membership,
        tenantId,
    );

    const getAllMembershipsUseCase = new GetAllMembershipsUseCase(
        membershipsRepository,
    );
    const createMembershipUseCase = new CreateMembershipUseCase(
        membershipsRepository,
    );
    const getMembershipByIdUseCase = new GetMembershipByIdUseCase(
        membershipsRepository,
    );
    const updateMembershipUseCase = new UpdateMembershipUseCase(
        membershipsRepository,
    );
    const deleteMembershipUseCase = new DeleteMembershipUseCase(
        membershipsRepository,
    );
    const restoreMembershipUseCase = new RestoreMembershipUseCase(
        membershipsRepository,
    );
    const cancelMembershipUseCase = new CancelMembershipUseCase(
        membershipsRepository,
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
