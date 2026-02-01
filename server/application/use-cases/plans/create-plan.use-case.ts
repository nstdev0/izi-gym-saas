import {
  CreatePlanInput,
  IPlansRepository,
} from "@/server/application/repositories/plans.repository.interface";
import { Plan } from "@/server/domain/entities/Plan";

export class CreatePlanUseCase {
  constructor(private readonly repository: IPlansRepository) {}

  async execute(input: CreatePlanInput): Promise<Plan> {
    return await this.repository.create(input);
  }
}
