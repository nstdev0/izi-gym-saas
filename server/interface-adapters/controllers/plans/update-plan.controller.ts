import { UpdatePlanInput } from "@/server/application/dtos/plans.dto";
import { UpdatePlanUseCase } from "@/server/application/use-cases/plans/update-plan.use-case";
import { BadRequestError } from "@/server/domain/errors/common";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class UpdatePlanController implements ControllerExecutor<UpdatePlanInput, void> {
  constructor(private readonly useCase: UpdatePlanUseCase) { }

  async execute(input: UpdatePlanInput, id?: string): Promise<void> {
    if (!id) {
      throw new BadRequestError("No se proporcionó un id");
    }
    await this.useCase.execute(id, input);
  }
}

export type IUpdatePlanUseCase = InstanceType<typeof UpdatePlanUseCase>;
