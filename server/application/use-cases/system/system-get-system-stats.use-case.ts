import { ISystemRepository } from "@/server/application/repositories/system.repository.interface";
import { SystemStats } from "@/server/domain/types/system";

export interface ISystemGetSystemStatsUseCase {
    execute(): Promise<SystemStats>;
}

export class SystemGetSystemStatsUseCase implements ISystemGetSystemStatsUseCase {
    constructor(private readonly systemRepository: ISystemRepository) { }

    async execute(): Promise<SystemStats> {
        return this.systemRepository.getGlobalStats();
    }
}
