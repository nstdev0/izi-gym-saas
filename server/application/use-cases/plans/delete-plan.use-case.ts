import { IPlansRepository } from "@/server/application/repositories/plans.repository.interface";
import { Plan } from "@/server/domain/entities/Plan";

export class DeletePlanUseCase {
  constructor(private readonly repository: IPlansRepository) {}

  async execute(id: string): Promise<Plan> {
    return this.repository.delete(id);
  }
}
