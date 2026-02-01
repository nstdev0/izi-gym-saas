import { IMembershipsRepository } from "@/server/application/repositories/memberships.repository.interface";
import { Membership } from "@/server/domain/entities/Membership";

export class DeleteMembershipUseCase {
  constructor(private readonly repository: IMembershipsRepository) {}

  async execute(id: string): Promise<Membership> {
    return this.repository.delete(id);
  }
}
