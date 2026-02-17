import {
  IPlansRepository,
} from "@/server/application/repositories/plans.repository.interface";
import { ConflictError } from "@/server/domain/errors/common";
import { CreatePlanInput } from "../../dtos/plans.dto";
import { slugify } from "@/shared/utils/text.utils";

export class CreatePlanUseCase {
  constructor(private readonly repository: IPlansRepository) { }

  async execute(input: CreatePlanInput): Promise<void> {
    const validatePlan = await this.repository.findUnique({
      name: input.name
    })
    if (validatePlan) {
      throw new ConflictError(`El plan "${input.name}" ya existe`)
    }
    const slug = slugify(input.name);
    await this.repository.create({ ...input, slug });
  }
}
