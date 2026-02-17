import { IMembershipsRepository } from "../../repositories/memberships.repository.interface";

export interface IRestoreMembershipUseCase {
    execute(id: string): Promise<void>;
}

export class RestoreMembershipUseCase implements IRestoreMembershipUseCase {
    constructor(private readonly repo: IMembershipsRepository) { }

    async execute(id: string): Promise<void> {
        await this.repo.restore(id);
    }
}