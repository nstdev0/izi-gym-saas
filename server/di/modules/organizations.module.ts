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
import { SubscriptionRepository } from "@/server/infrastructure/persistence/repositories/subscription.repository";
import { UsersRepository } from "@/server/infrastructure/persistence/repositories/users.repository";
import { ClerkAuthService } from "@/server/infrastructure/services/clerk-auth.service";

export function createOrganizationsModule(prisma: PrismaClient, tenantId: string) {
    const organizationsRepository = new OrganizationsRepository(
        prisma.organization,
        tenantId,
    );

    const getAllOrganizationsUseCase = new GetAllOrganizationsUseCase(
        organizationsRepository,
    );
    const plansRepository = new PlansRepository(prisma.plan, tenantId);
    const subscriptionRepository = new SubscriptionRepository(prisma.subscription, tenantId);
    const usersRepository = new UsersRepository(prisma.user, tenantId);
    const authProvider = new ClerkAuthService();

    const createOrganizationUseCase = new CreateOrganizationUseCase(
        organizationsRepository,
        plansRepository,
        subscriptionRepository,
        usersRepository,
        authProvider,
    );
    const upgradeOrganizationPlanUseCase = new UpgradeOrganizationPlanUseCase(
        organizationsRepository,
    );

    const getAllOrganizationsController = new GetAllOrganizationsController(
        getAllOrganizationsUseCase,
    );
    const createOrganizationController = new CreateOrganizationController(
        createOrganizationUseCase,
    );
    const getOrganizationByIdController = new GetOrganizationByIdController(
        new GetOrganizationByIdUseCase(organizationsRepository),
    );
    const getOrganizationController = new GetOrganizationByIdController(
        new GetOrganizationByIdUseCase(organizationsRepository),
    );
    const updateOrganizationController = new UpdateOrganizationController(
        new UpdateOrganizationUseCase(organizationsRepository),
    );
    const deleteOrganizationController = new DeleteOrganizationController(
        new DeleteOrganizationUseCase(organizationsRepository),
    );
    const updateOrganizationSettingsController = new UpdateOrganizationSettingsController(
        new UpdateOrganizationSettingsUseCase(organizationsRepository),
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
