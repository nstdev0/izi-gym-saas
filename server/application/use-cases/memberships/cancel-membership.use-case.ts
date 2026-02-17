import { IMembershipsRepository } from "../../repositories/memberships.repository.interface";

export class CancelMembershipUseCase {
    constructor(private readonly repo: IMembershipsRepository) { }

    async execute(id: string): Promise<void> {
        await this.repo.cancel(id);
    }
}

export type ICancelMembershipUseCase = InstanceType<typeof CancelMembershipUseCase>