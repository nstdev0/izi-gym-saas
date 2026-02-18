import { GetPlanByIdUseCase } from "@/server/application/use-cases/plans/get-plan-by-id.use-case";
import { BadRequestError, NotFoundError } from "@/server/domain/errors/common";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { PlanResponse } from "@/shared/types/plans.types";
import { PlanResponseMapper } from "../../mappers/plan-response.mapper";

export class GetPlanByIdController implements ControllerExecutor<void, PlanResponse> {
  constructor(private readonly useCase: GetPlanByIdUseCase) { }

  async execute(_input: void, id?: string): Promise<PlanResponse> {
    if (!id) {
      throw new BadRequestError("No se proporcionó un id");
    }

    const plan = await this.useCase.execute(id);

    if (!plan) {
      throw new NotFoundError("Plan no encontrado");
    }

    return PlanResponseMapper.toResponse(plan);
  }
}

export type IGetPlanByIdUseCase = InstanceType<typeof GetPlanByIdUseCase>;
