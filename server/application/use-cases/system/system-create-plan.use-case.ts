import { CreatePlanInput } from "@/server/domain/types/plans";
import { ISystemRepository } from "../../repositories/system.repository.interface";

export class SystemCreatePlanUseCase {
    constructor(private systemRepository: ISystemRepository) { }

    async execute(data: CreatePlanInput): Promise<void> {
        return this.systemRepository.createPlan(data);
    }
}
