import { IMembershipsRepository } from "@/server/application/repositories/memberships.repository.interface";
import { CreateMembershipInput } from "@/server/domain/types/memberships";
import { Membership } from "@/server/domain/entities/Membership";

export interface ICreateMembershipUseCase {
  execute(input: CreateMembershipInput): Promise<Membership>;
}

export class CreateMembershipUseCase implements ICreateMembershipUseCase {
  constructor(private membershipsRepository: IMembershipsRepository) {}

  async execute(input: CreateMembershipInput): Promise<Membership> {
    return this.membershipsRepository.create(input);
  }
}
