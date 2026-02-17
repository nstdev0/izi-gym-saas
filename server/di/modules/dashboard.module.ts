import { PrismaDashboardRepository } from "@/server/infrastructure/persistence/repositories/dashboard.repository";
import { GetDashboardMetricsUseCase } from "@/server/application/use-cases/dashboard/get-dashboard-metrics.use-case";
import { GetHistoricStartDateUseCase } from "@/server/application/use-cases/dashboard/get-historic-start-date.use-case";

import { GetDashboardMetricsController } from "@/server/interface-adapters/controllers/dashboard/get-dashboard-metrics.controller";
import { GetHistoricStartDateController } from "@/server/interface-adapters/controllers/dashboard/get-historic-start-date.controller";
import { PrismaClient } from "@/generated/prisma/client";

export function createDashboardModule(prisma: PrismaClient, tenantId: string) {
    const dashboardRepository = new PrismaDashboardRepository(prisma, tenantId);

    const getDashboardMetricsUseCase = new GetDashboardMetricsUseCase(
        dashboardRepository,
    );
    const getHistoricStartDateUseCase = new GetHistoricStartDateUseCase(
        dashboardRepository,
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
