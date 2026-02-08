import { ISystemRepository } from "../../repositories/system.repository.interface";

export class SystemGetRevenueStatsUseCase {
    constructor(private systemRepository: ISystemRepository) { }

    async execute(): Promise<any> {
        return this.systemRepository.getRevenueStats();
    }
}
