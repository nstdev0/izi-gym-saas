import { RevenueStats } from "@/server/domain/types/system";
import { ISystemRepository } from "../../repositories/system.repository.interface";

export class SystemGetRevenueStatsUseCase {
    constructor(private systemRepository: ISystemRepository) { }

    async execute(): Promise<RevenueStats[]> {
        return this.systemRepository.getRevenueStats();
    }
}
