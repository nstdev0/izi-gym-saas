import { UpdatePlanSchema } from "@/server/application/dtos/plans.dto";
import { UpdatePlanUseCase } from "@/server/application/use-cases/plans/update-plan.use-case";

export class UpdatePlanController {
  constructor(private readonly useCase: UpdatePlanUseCase) {}

  async execute({ id, data }: { id: string; data: unknown }) {
    const validatedData = UpdatePlanSchema.parse(data);
    const plan = await this.useCase.execute(id, validatedData);
    return plan;
  }
}
