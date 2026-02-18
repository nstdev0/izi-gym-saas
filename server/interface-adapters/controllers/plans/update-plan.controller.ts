import { UpdatePlanInput } from "@/server/application/dtos/plans.dto";
import { UpdatePlanUseCase } from "@/server/application/use-cases/plans/update-plan.use-case";
import { BadRequestError } from "@/server/domain/errors/common";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { PlanResponse } from "@/shared/types/plans.types";
import { PlanResponseMapper } from "../../mappers/plan-response.mapper";

export class UpdatePlanController implements ControllerExecutor<UpdatePlanInput, PlanResponse> {
  constructor(private readonly useCase: UpdatePlanUseCase) { }

  async execute(input: UpdatePlanInput, id?: string): Promise<PlanResponse> {
    if (!id) {
      throw new BadRequestError("No se proporcionó un id");
    }
    const entity = await this.useCase.execute(id, input);
    return PlanResponseMapper.toResponse(entity);
  }
}

export type IUpdatePlanUseCase = InstanceType<typeof UpdatePlanUseCase>;
