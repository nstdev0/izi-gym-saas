import { NotFoundError } from "@/server/domain/errors/common";
import { IMembershipsRepository } from "../../repositories/memberships.repository.interface";
import { Membership } from "@/server/domain/entities/Membership";

export class RestoreMemberUseCase {
    constructor(private readonly repo: IMembershipsRepository) { }

    async execute(id: string): Promise<void> {
        const membership = await this.repo.findUnique({ id: id })

        if (!membership) throw new NotFoundError("Membresía no encontrada")

        return await this.repo.restore(id)
    }
}