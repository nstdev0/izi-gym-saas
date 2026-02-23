import { OrganizationsRepository } from "@/server/infrastructure/persistence/repositories/organizations.repository";
import { GetAllOrganizationsUseCase } from "@/server/application/use-cases/organizations/get-all-organizations.use-case";
import { CreateOrganizationUseCase } from "@/server/application/use-cases/organizations/create-organization.use-case";
import { GetAllOrganizationsController } from "@/server/interface-adapters/controllers/organizations/get-all-organizations.controller";
import { CreateOrganizationController } from "@/server/interface-adapters/controllers/organizations/create-organization.controller";
import { GetOrganizationByIdUseCase } from "@/server/application/use-cases/organizations/get-organization-by-id.use-case";
import { UpdateOrganizationUseCase } from "@/server/application/use-cases/organizations/update-organization.use-case";
import { DeleteOrganizationUseCase } from "@/server/application/use-cases/organizations/delete-organization.use-case";
import { GetOrganizationByIdController } from "@/server/interface-adapters/controllers/organizations/get-organization-by-id.controller";
import { UpdateOrganizationController } from "@/server/interface-adapters/controllers/organizations/update-organization.controller";
import { DeleteOrganizationController } from "@/server/interface-adapters/controllers/organizations/delete-organization.controller";
import { UpdateOrganizationSettingsController } from "@/server/interface-adapters/controllers/organizations/update-organization-settings.controller";
import { UpdateOrganizationSettingsUseCase } from "@/server/application/use-cases/organizations/update-organization-settings.use-case";
import { UpgradeOrganizationPlanController } from "@/server/interface-adapters/controllers/organizations/upgrade-organization-plan.controller";
import { UpgradeOrganizationPlanUseCase } from "@/server/application/use-cases/organizations/upgrade-organization-plan.use-case";
import { PrismaClient } from "@/generated/prisma/client";
import { PlansRepository } from "@/server/infrastructure/persistence/repositories/plans.repository";
import { UsersRepository } from "@/server/infrastructure/persistence/repositories/users.repository";
import { ClerkAuthService } from "@/server/infrastructure/services/clerk-auth.service";
import { PrismaUnitOfWork } from "@/server/infrastructure/persistence/prisma-unit-of-work";
import type { AuthModule } from "@/server/di/modules/auth.module";

export function createOrganizationsModule(prisma: PrismaClient, tenantId: string, authModule: AuthModule) {
    const organizationsRepository = new OrganizationsRepository(
        prisma.organization,
        tenantId,
    );
    const plansRepository = new PlansRepository(prisma.plan, tenantId);
    const usersRepository = new UsersRepository(prisma.user, tenantId);

    const authProvider = new ClerkAuthService();
    const unitOfWork = new PrismaUnitOfWork(prisma);

    // Use cases
    const getAllOrganizationsUseCase = new GetAllOrganizationsUseCase(
        organizationsRepository,
        authModule.permissionService,
    );
    const createOrganizationUseCase = new CreateOrganizationUseCase(
        plansRepository,
        organizationsRepository,
        usersRepository,
        authProvider,
        unitOfWork,
    );
    const upgradeOrganizationPlanUseCase = new UpgradeOrganizationPlanUseCase(
        organizationsRepository,
        authModule.permissionService,
        unitOfWork,
        tenantId,
    );
    const updateOrganizationSettingsUseCase = new UpdateOrganizationSettingsUseCase(
        organizationsRepository,
        authProvider,
        authModule.permissionService,
        unitOfWork,
    )

    // Controllers
    const getAllOrganizationsController = new GetAllOrganizationsController(
        getAllOrganizationsUseCase,
    );
    const createOrganizationController = new CreateOrganizationController(
        createOrganizationUseCase,
    );
    const getOrganizationByIdController = new GetOrganizationByIdController(
        new GetOrganizationByIdUseCase(organizationsRepository, authModule.permissionService),
    );
    const getOrganizationController = new GetOrganizationByIdController(
        new GetOrganizationByIdUseCase(organizationsRepository, authModule.permissionService),
    );
    const updateOrganizationController = new UpdateOrganizationController(
        new UpdateOrganizationUseCase(organizationsRepository, authModule.permissionService),
    );
    const deleteOrganizationController = new DeleteOrganizationController(
        new DeleteOrganizationUseCase(organizationsRepository, authModule.permissionService),
    );
    const updateOrganizationSettingsController = new UpdateOrganizationSettingsController(
        updateOrganizationSettingsUseCase,
    );
    const upgradeOrganizationPlanController = new UpgradeOrganizationPlanController(
        upgradeOrganizationPlanUseCase,
    );

    return {
        getAllOrganizationsController,
        createOrganizationController,
        getOrganizationByIdController,
        getOrganizationController,
        updateOrganizationController,
        deleteOrganizationController,
        updateOrganizationSettingsController,
        upgradeOrganizationPlanController,
    };
}
