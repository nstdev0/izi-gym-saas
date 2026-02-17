import { IMembershipsRepository } from "@/server/application/repositories/memberships.repository.interface";
import { UpdateMembershipInput } from "@/server/domain/types/memberships";

export class UpdateMembershipUseCase {
  constructor(private readonly repository: IMembershipsRepository) { }

  async execute(id: string, data: UpdateMembershipInput): Promise<void> {
    await this.repository.update(id, data);
  }
}
