import { PlansRepository } from "@/server/infrastructure/persistence/repositories/plans.repository";
import { GetAllPlansUseCase } from "@/server/application/use-cases/plans/get-all-plans.use-case";
import { CreatePlanUseCase } from "@/server/application/use-cases/plans/create-plan.use-case";
import { GetPlanByIdUseCase } from "@/server/application/use-cases/plans/get-plan-by-id.use-case";
import { UpdatePlanUseCase } from "@/server/application/use-cases/plans/update-plan.use-case";
import { DeletePlanUseCase } from "@/server/application/use-cases/plans/delete-plan.use-case";
import { RestorePlanUseCase } from "@/server/application/use-cases/plans/restore-plan.use-case";

import { GetAllPlansController } from "@/server/interface-adapters/controllers/plans/get-all-plans.controller";
import { CreatePlanController } from "@/server/interface-adapters/controllers/plans/create-plan.controller";
import { GetPlanByIdController } from "@/server/interface-adapters/controllers/plans/get-plan-by-id.controller";
import { UpdatePlanController } from "@/server/interface-adapters/controllers/plans/update-plan.controller";
import { DeletePlanController } from "@/server/interface-adapters/controllers/plans/delete-plan.controller";
import { RestorePlanController } from "@/server/interface-adapters/controllers/plans/restore-plan.controller";
import { PrismaClient } from "@/generated/prisma/client";

export function createPlansModule(prisma: PrismaClient, tenantId: string) {
    const plansRepository = new PlansRepository(prisma.plan, tenantId);

    const getAllPlansUseCase = new GetAllPlansUseCase(plansRepository);
    const createPlanUseCase = new CreatePlanUseCase(plansRepository);
    const getPlanByIdUseCase = new GetPlanByIdUseCase(plansRepository);
    const updatePlanUseCase = new UpdatePlanUseCase(plansRepository);
    const deletePlanUseCase = new DeletePlanUseCase(plansRepository);
    const restorePlanUseCase = new RestorePlanUseCase(plansRepository);

    const getAllPlansController = new GetAllPlansController(getAllPlansUseCase);
    const createPlanController = new CreatePlanController(createPlanUseCase);
    const getPlanByIdController = new GetPlanByIdController(getPlanByIdUseCase);
    const updatePlanController = new UpdatePlanController(updatePlanUseCase);
    const deletePlanController = new DeletePlanController(deletePlanUseCase);
    const restorePlanController = new RestorePlanController(restorePlanUseCase);

    return {
        getAllPlansController,
        createPlanController,
        getPlanByIdController,
        updatePlanController,
        deletePlanController,
        restorePlanController,
    };
}
