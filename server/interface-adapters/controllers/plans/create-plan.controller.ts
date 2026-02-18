import { CreatePlanInput } from "@/server/application/dtos/plans.dto";
import { CreatePlanUseCase } from "@/server/application/use-cases/plans/create-plan.use-case";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { PlanResponse } from "@/shared/types/plans.types";
import { PlanResponseMapper } from "../../mappers/plan-response.mapper";

export class CreatePlanController implements ControllerExecutor<CreatePlanInput, PlanResponse> {
  constructor(private readonly useCase: CreatePlanUseCase) { }

  async execute(input: CreatePlanInput): Promise<PlanResponse> {
    const entity = await this.useCase.execute(input);
    return PlanResponseMapper.toResponse(entity);
  }
}

export type ICreatePlanUseCase = InstanceType<typeof CreatePlanUseCase>;
