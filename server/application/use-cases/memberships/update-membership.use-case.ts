import { IMembershipsRepository } from "@/server/application/repositories/memberships.repository.interface";
import { UpdateMembershipInput } from "@/server/domain/types/memberships";
import { Membership } from "@/server/domain/entities/Membership";
import { IPermissionService } from "@/server/application/services/permission.service.interface";
import { NotFoundError } from "@/server/domain/errors/common";

export class UpdateMembershipUseCase {
  constructor(
    private readonly repository: IMembershipsRepository,
    private readonly permissions: IPermissionService
  ) { }

  async execute(id: string, data: UpdateMembershipInput): Promise<Membership> {
    this.permissions.require('memberships:update');

    const membership = await this.repository.findUnique({ id } as any);
    if (!membership) {
      throw new NotFoundError("Membresía no encontrada");
    }

    return await this.repository.update(id, data);
  }
}
