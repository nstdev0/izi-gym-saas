import { IPlansRepository } from "@/server/application/repositories/plans.repository.interface";
import { NotFoundError } from "@/server/domain/errors/common";

export class RestorePlanUseCase {
    constructor(private readonly repo: IPlansRepository) { }

    async execute(id: string): Promise<void> {
        const plan = await this.repo.findUnique({ id });

        if (!plan) throw new NotFoundError("Plan no encontrado");

        await this.repo.restore(id);

        await this.repo.findUnique({ id });
    }
}

export type IRestorePlanUseCase = InstanceType<typeof RestorePlanUseCase>
