import { IPlansRepository } from "@/server/application/repositories/plans.repository.interface";

import { IPermissionService } from "@/server/application/services/permission.service.interface";

export class DeletePlanUseCase {
  constructor(
    private readonly repository: IPlansRepository,
    private readonly permissions: IPermissionService
  ) { }

  async execute(id: string): Promise<void> {
    this.permissions.require('plans:delete');
    await this.repository.delete(id);
  }
}
