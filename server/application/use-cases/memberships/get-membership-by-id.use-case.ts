import { IMembershipsRepository } from "@/server/application/repositories/memberships.repository.interface";
import { Membership } from "@/server/domain/entities/Membership";

export class GetMembershipByIdUseCase {
  constructor(private readonly repository: IMembershipsRepository) {}

  async execute(id: string): Promise<Membership | null> {
    return this.repository.findUnique({ id });
  }
}
