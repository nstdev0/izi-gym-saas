import { IPlansRepository } from "@/server/application/repositories/plans.repository.interface";
import { Plan } from "@/server/domain/entities/Plan";

import { IPermissionService } from "@/server/application/services/permission.service.interface";

export class GetPlanByIdUseCase {
  constructor(
    private readonly repository: IPlansRepository,
    private readonly permissions: IPermissionService
  ) { }

  async execute(id: string): Promise<Plan | null> {
    this.permissions.require('plans:read');
    const response = await this.repository.findUnique({ id });
    if (response) {
      response.price = Number(response.price);
    }
    return response;
  }
}
