import { GetPlanByIdUseCase } from "@/server/application/use-cases/plans/get-plan-by-id.use-case";
import { Plan } from "@/server/domain/entities/Plan";
import { BadRequestError, NotFoundError } from "@/server/domain/errors/common";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class GetPlanByIdController implements ControllerExecutor<void, Plan | null> {
  constructor(private readonly useCase: GetPlanByIdUseCase) { }

  async execute(_input: void, id?: string): Promise<Plan | null> {
    if (!id) {
      throw new BadRequestError("No se proporcionó un id");
    }

    const plan = await this.useCase.execute(id);

    if (!plan) {
      throw new NotFoundError("Plan no encontrado");
    }

    return plan;
  }
}

export type IGetPlanByIdUseCase = InstanceType<typeof GetPlanByIdUseCase>;
