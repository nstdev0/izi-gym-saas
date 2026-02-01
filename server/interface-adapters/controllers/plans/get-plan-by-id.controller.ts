import { GetPlanByIdUseCase } from "@/server/application/use-cases/plans/get-plan-by-id.use-case";

export class GetPlanByIdController {
  constructor(private readonly useCase: GetPlanByIdUseCase) {}

  async execute(id: string) {
    const plan = await this.useCase.execute(id);
    return plan;
  }
}
