import { DeletePlanUseCase } from "@/server/application/use-cases/plans/delete-plan.use-case";
import { BadRequestError } from "@/server/domain/errors/common";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class DeletePlanController implements ControllerExecutor<void, void> {
  constructor(private readonly useCase: DeletePlanUseCase) { }

  async execute(_input: void, id?: string): Promise<void> {
    if (!id) {
      throw new BadRequestError("No se proporcionó un id");
    }
    await this.useCase.execute(id);
  }
}

export type IDeletePlanUseCase = InstanceType<typeof DeletePlanUseCase>;
