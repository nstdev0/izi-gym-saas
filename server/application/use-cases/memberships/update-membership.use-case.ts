import { IMembershipsRepository } from "@/server/application/repositories/memberships.repository.interface";
import { UpdateMembershipInput } from "@/server/domain/types/memberships";
import { Membership } from "@/server/domain/entities/Membership";

export class UpdateMembershipUseCase {
  constructor(private readonly repository: IMembershipsRepository) { }

  async execute(id: string, data: UpdateMembershipInput): Promise<Membership> {
    return await this.repository.update(id, data);
  }
}
