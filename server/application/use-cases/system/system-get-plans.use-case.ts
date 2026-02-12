import { OrganizationPlan } from "@/server/domain/entities/OrganizationPlan";
import { ISystemRepository } from "../../repositories/system.repository.interface";

export class SystemGetPlansUseCase {
    constructor(private systemRepository: ISystemRepository) { }

    async execute(): Promise<OrganizationPlan[]> {
        return this.systemRepository.getPlans();
    }
}
