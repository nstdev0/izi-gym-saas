import { IPlansRepository } from "@/server/application/repositories/plans.repository.interface";
import { Plan } from "@/server/domain/entities/Plan";
import { ConflictError } from "@/server/domain/errors/common";
import { UpdatePlanInput } from "@/server/domain/types/plans";

export class UpdatePlanUseCase {
  constructor(private readonly repository: IPlansRepository) { }

  async execute(id: string, data: UpdatePlanInput): Promise<Plan> {
    const validateUniqueName = await this.repository.findUnique({ name: data.name })

    if (validateUniqueName && validateUniqueName.id !== id) {
      throw new ConflictError(`El plan "${data.name}" ya existe`);
    }
    return this.repository.update(id, data);
  }
}
