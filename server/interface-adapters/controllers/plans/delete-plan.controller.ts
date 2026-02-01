import { DeletePlanUseCase } from "@/server/application/use-cases/plans/delete-plan.use-case";

export class DeletePlanController {
  constructor(private readonly useCase: DeletePlanUseCase) {}

  async execute(id: string) {
    const plan = await this.useCase.execute(id);
    return plan;
  }
}
