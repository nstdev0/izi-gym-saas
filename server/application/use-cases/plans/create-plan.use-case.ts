import {
  IPlansRepository,
} from "@/server/application/repositories/plans.repository.interface";
import { Plan } from "@/server/domain/entities/Plan";
import { ConflictError, ValidationError } from "@/server/domain/errors/common";
import { CreatePlanInput } from "../../dtos/plans.dto";

export class CreatePlanUseCase {
  constructor(private readonly repository: IPlansRepository) { }

  async execute(input: CreatePlanInput): Promise<Plan> {
    const validatePlan = await this.repository.findUnique({
      name: input.name
    })
    if (validatePlan) {
      throw new ConflictError(`El plan "${input.name}" ya existe`)
    }
    const slug = input.name.toLowerCase().trim().replace(/\s+/g, '-');
    return await this.repository.create({ ...input, slug });
  }
}
