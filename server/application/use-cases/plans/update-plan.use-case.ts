import { IPlansRepository } from "@/server/application/repositories/plans.repository.interface";
import { Plan } from "@/server/domain/entities/Plan";
import { UpdatePlanInput } from "@/server/domain/types/plans";

export class UpdatePlanUseCase {
  constructor(private readonly repository: IPlansRepository) {}

  async execute(id: string, data: UpdatePlanInput): Promise<Plan> {
    return this.repository.update(id, data);
  }
}
