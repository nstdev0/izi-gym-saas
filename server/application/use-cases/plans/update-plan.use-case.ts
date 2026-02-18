import { IPlansRepository } from "@/server/application/repositories/plans.repository.interface";
import { Plan } from "@/server/domain/entities/Plan";
import { ConflictError } from "@/server/domain/errors/common";
import { UpdatePlanInput } from "@/server/domain/types/plans";

import { IPermissionService } from "@/server/application/services/permission.service.interface";

export class UpdatePlanUseCase {
  constructor(
    private readonly repository: IPlansRepository,
    private readonly permissions: IPermissionService
  ) { }

  async execute(id: string, data: UpdatePlanInput): Promise<Plan> {
    this.permissions.require('plans:update');
    const validateUniqueName = await this.repository.findUnique({ name: data.name })

    if (validateUniqueName && validateUniqueName.id !== id) {
      throw new ConflictError(`El plan "${data.name}" ya existe`);
    }
    return await this.repository.update(id, data);
  }
}
