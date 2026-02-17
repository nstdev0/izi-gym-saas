import { SystemRepository } from "@/server/infrastructure/persistence/repositories/system.repository";
import { SystemGetSystemStatsUseCase } from "@/server/application/use-cases/system/system-get-system-stats.use-case";
import { SystemGetAllOrganizationsUseCase } from "@/server/application/use-cases/system/system-get-all-organizations.use-case";
import { SystemSuspendOrganizationUseCase } from "@/server/application/use-cases/system/system-suspend-organization.use-case";
import { SystemGetRecentSignupsUseCase } from "@/server/application/use-cases/system/system-get-recent-signups.use-case";
import { SystemGetRevenueStatsUseCase } from "@/server/application/use-cases/system/system-get-revenue-stats.use-case";
import { SystemGetSystemConfigUseCase } from "@/server/application/use-cases/system/system-get-system-config.use-case";
import { SystemUpdateSystemConfigUseCase } from "@/server/application/use-cases/system/system-update-system-config.use-case";
import { SystemUpdatePlanUseCase } from "@/server/application/use-cases/system/system-update-plan.use-case";
import { SystemCreatePlanUseCase } from "@/server/application/use-cases/system/system-create-plan.use-case";
import { SystemGetPlansUseCase } from "@/server/application/use-cases/system/system-get-plans.use-case";

import { SystemGetSystemStatsController } from "@/server/interface-adapters/controllers/system/system-get-system-stats.controller";
import { SystemGetAllOrganizationsController } from "@/server/interface-adapters/controllers/system/system-get-all-organizations.controller";
import { SystemSuspendOrganizationController } from "@/server/interface-adapters/controllers/system/system-suspend-organization.controller";
import { SystemGetRecentSignupsController } from "@/server/interface-adapters/controllers/system/system-get-recent-signups.controller";
import { SystemGetRevenueStatsController } from "@/server/interface-adapters/controllers/system/system-get-revenue-stats.controller";
import { SystemGetSystemConfigController } from "@/server/interface-adapters/controllers/system/system-get-system-config.controller";
import { SystemUpdateSystemConfigController } from "@/server/interface-adapters/controllers/system/update-system-config.controller";
import { SystemGetPlansController } from "@/server/interface-adapters/controllers/system/system-get-plans.controller";
import { SystemCreatePlanController } from "@/server/interface-adapters/controllers/system/system-create-plan.controller";
import { SystemUpdatePlanController } from "@/server/interface-adapters/controllers/system/update-plan.controller";

export function createSystemModule() {
    const systemRepository = new SystemRepository();

    const getSystemStatsUseCase = new SystemGetSystemStatsUseCase(systemRepository);
    const getAllOrganizationsSystemUseCase = new SystemGetAllOrganizationsUseCase(systemRepository);
    const suspendOrganizationUseCase = new SystemSuspendOrganizationUseCase(systemRepository);
    const getRecentSignupsUseCase = new SystemGetRecentSignupsUseCase(systemRepository);
    const getRevenueStatsUseCase = new SystemGetRevenueStatsUseCase(systemRepository);
    const getSystemConfigUseCase = new SystemGetSystemConfigUseCase(systemRepository);
    const updateSystemConfigUseCase = new SystemUpdateSystemConfigUseCase(systemRepository);
    const getSystemPlansUseCase = new SystemGetPlansUseCase(systemRepository);
    const createSystemPlanUseCase = new SystemCreatePlanUseCase(systemRepository);
    const updateSystemPlanUseCase = new SystemUpdatePlanUseCase(systemRepository);

    const getSystemStatsController = new SystemGetSystemStatsController(getSystemStatsUseCase);
    const getAllOrganizationsSystemController = new SystemGetAllOrganizationsController(getAllOrganizationsSystemUseCase);
    const suspendOrganizationController = new SystemSuspendOrganizationController(suspendOrganizationUseCase);
    const getRecentSignupsController = new SystemGetRecentSignupsController(getRecentSignupsUseCase);
    const getRevenueStatsController = new SystemGetRevenueStatsController(getRevenueStatsUseCase);
    const getSystemConfigController = new SystemGetSystemConfigController(getSystemConfigUseCase);
    const updateSystemConfigController = new SystemUpdateSystemConfigController(updateSystemConfigUseCase);
    const getSystemPlansController = new SystemGetPlansController(getSystemPlansUseCase);
    const createSystemPlanController = new SystemCreatePlanController(createSystemPlanUseCase);
    const updateSystemPlanController = new SystemUpdatePlanController(updateSystemPlanUseCase);

    return {
        getSystemStatsController,
        getAllOrganizationsSystemController,
        suspendOrganizationController,
        getRecentSignupsController,
        getRevenueStatsController,
        getSystemConfigController,
        updateSystemConfigController,
        getSystemPlansController,
        createSystemPlanController,
        updateSystemPlanController,
    };
}
