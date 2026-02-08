import { ISystemRepository } from "../../repositories/system.repository.interface";

export class SystemUpdatePlanUseCase {
    constructor(private systemRepository: ISystemRepository) { }

    async execute(id: string, data: any): Promise<void> {
        return this.systemRepository.updatePlan(id, data);
    }
}
