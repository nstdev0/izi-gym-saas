import { IPlansRepository } from "@/server/application/repositories/plans.repository.interface";
import { Plan } from "@/server/domain/entities/Plan";

export class GetPlanByIdUseCase {
  constructor(private readonly repository: IPlansRepository) { }

  async execute(id: string): Promise<Plan | null> {
    const response = await this.repository.findUnique({ id });
    if (response) {
      response.price = Number(response.price);
    }
    return response;
  }
}
