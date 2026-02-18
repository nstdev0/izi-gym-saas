import { PrismaDashboardRepository } from "@/server/infrastructure/persistence/repositories/dashboard.repository";
import { GetDashboardMetricsUseCase } from "@/server/application/use-cases/dashboard/get-dashboard-metrics.use-case";
import { GetHistoricStartDateUseCase } from "@/server/application/use-cases/dashboard/get-historic-start-date.use-case";

import { GetDashboardMetricsController } from "@/server/interface-adapters/controllers/dashboard/get-dashboard-metrics.controller";
import { GetHistoricStartDateController } from "@/server/interface-adapters/controllers/dashboard/get-historic-start-date.controller";
import { PrismaClient } from "@/generated/prisma/client";
import type { AuthModule } from "@/server/di/modules/auth.module";

export function createDashboardModule(prisma: PrismaClient, tenantId: string, authModule: AuthModule) {
    const dashboardRepository = new PrismaDashboardRepository(prisma, tenantId);

    const getDashboardMetricsUseCase = new GetDashboardMetricsUseCase(
        dashboardRepository,
        authModule.permissionService,
    );
    const getHistoricStartDateUseCase = new GetHistoricStartDateUseCase(
        dashboardRepository,
        authModule.permissionService,
    );

    const getDashboardMetricsController = new GetDashboardMetricsController(
        getDashboardMetricsUseCase,
    );
    const getHistoricStartDateController = new GetHistoricStartDateController(
        getHistoricStartDateUseCase,
    );

    return {
        getDashboardMetricsController,
        getHistoricStartDateController,
    };
}
