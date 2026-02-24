import { IOrganizationRepository } from "@/server/application/repositories/organizations.repository.interface";
import { IPermissionService } from "@/server/application/services/permission.service.interface";

export class DeleteOrganizationUseCase {
  constructor(
    private readonly repository: IOrganizationRepository,
    private readonly permissions: IPermissionService
  ) { }

  async execute(id: string): Promise<void> {
    this.permissions.require('org:delete');

    // Note: If you're a super admin, perhaps id matters. If not, standard DI organization repo delete(id) suffices
    await this.repository.delete(id);
  }
}

export type IDeleteOrganizationUseCase = InstanceType<typeof DeleteOrganizationUseCase>;
