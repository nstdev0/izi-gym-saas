import { IMembershipsRepository } from "@/server/application/repositories/memberships.repository.interface";
import { Membership } from "@/server/domain/entities/Membership";
import { UpdateMembershipInput } from "@/server/domain/types/memberships";

export class UpdateMembershipUseCase {
  constructor(private readonly repository: IMembershipsRepository) {}

  async execute(id: string, data: UpdateMembershipInput): Promise<Membership> {
    return this.repository.update(id, data);
  }
}
