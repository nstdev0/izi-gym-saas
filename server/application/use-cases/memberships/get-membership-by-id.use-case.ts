import { IMembershipsRepository } from "@/server/application/repositories/memberships.repository.interface";
import { Membership } from "@/server/domain/entities/Membership";

export class GetMembershipByIdUseCase {
  constructor(private readonly repository: IMembershipsRepository) { }

  async execute(id: string): Promise<Membership | null> {
    const membership = await this.repository.findUnique({ id: id });
    if (membership) {
      membership.pricePaid = Number(membership.pricePaid);
    }
    return membership;
  }
}
