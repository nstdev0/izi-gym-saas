import { IMembershipsRepository } from "@/server/application/repositories/memberships.repository.interface";

export class DeleteMembershipUseCase {
  constructor(private readonly repository: IMembershipsRepository) { }

  async execute(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}

export type IDeleteMembershipUseCase = InstanceType<typeof DeleteMembershipUseCase>