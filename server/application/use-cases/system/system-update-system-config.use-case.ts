import { SystemConfig } from "@/server/domain/types/system";
import { ISystemRepository } from "../../repositories/system.repository.interface";

export class SystemUpdateSystemConfigUseCase {
    constructor(private systemRepository: ISystemRepository) { }

    async execute(data: Partial<SystemConfig>): Promise<void> {
        return this.systemRepository.updateSystemConfig(data);
    }
}
