import { IOrganizationRepository } from "@/server/application/repositories/organizations.repository.interface";
import { Organization } from "@/server/domain/entities/Organization";
import { IPermissionService } from "@/server/application/services/permission.service.interface";

export class GetOrganizationByIdUseCase {
  constructor(
    private readonly repository: IOrganizationRepository,
    private readonly permissions: IPermissionService
  ) { }

  async execute(id: string): Promise<Organization | null> {
    this.permissions.require('org:read');
    return this.repository.findById(id);
  }
}

export type IGetOrganizationByIdUseCase = InstanceType<typeof GetOrganizationByIdUseCase>;

