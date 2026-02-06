import { CreatePlanInput } from "@/server/application/dtos/plans.dto";
import { CreatePlanUseCase } from "@/server/application/use-cases/plans/create-plan.use-case";
import { Plan } from "@/server/domain/entities/Plan";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class CreatePlanController implements ControllerExecutor<CreatePlanInput, Plan> {
  constructor(private readonly useCase: CreatePlanUseCase) { }

  async execute(input: CreatePlanInput): Promise<Plan> {
    return await this.useCase.execute(input);
  }
}

export type ICreatePlanUseCase = InstanceType<typeof CreatePlanUseCase>;
