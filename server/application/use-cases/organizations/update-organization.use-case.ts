import { IOrganizationRepository } from "@/server/application/repositories/organizations.repository.interface";
import { UpdateOrganizationInput } from "@/server/domain/types/organizations";

import { IPermissionService } from "@/server/application/services/permission.service.interface";

export class UpdateOrganizationUseCase {
  constructor(
    private readonly repository: IOrganizationRepository,
    private readonly permissions: IPermissionService
  ) { }

  async execute(
    id: string,
    data: UpdateOrganizationInput,
  ): Promise<void> {
    this.permissions.require('org:update');
    await this.repository.update(id, data);
  }
}

export type IUpdateOrganizationUseCase = InstanceType<typeof UpdateOrganizationUseCase>;

