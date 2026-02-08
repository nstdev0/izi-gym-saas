import { ISystemRepository } from "../../repositories/system.repository.interface";

export class SystemCreatePlanUseCase {
    constructor(private systemRepository: ISystemRepository) { }

    async execute(data: any): Promise<void> {
        return this.systemRepository.createPlan(data);
    }
}
