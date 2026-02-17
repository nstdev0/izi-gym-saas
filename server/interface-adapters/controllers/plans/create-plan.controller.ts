import { CreatePlanInput } from "@/server/application/dtos/plans.dto";
import { CreatePlanUseCase } from "@/server/application/use-cases/plans/create-plan.use-case";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class CreatePlanController implements ControllerExecutor<CreatePlanInput, void> {
  constructor(private readonly useCase: CreatePlanUseCase) { }

  async execute(input: CreatePlanInput): Promise<void> {
    await this.useCase.execute(input);
  }
}

export type ICreatePlanUseCase = InstanceType<typeof CreatePlanUseCase>;
