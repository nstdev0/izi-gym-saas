import { SystemConfig } from "@/server/domain/types/system";
import { ISystemRepository } from "../../repositories/system.repository.interface";

export class SystemGetSystemConfigUseCase {
    constructor(private systemRepository: ISystemRepository) { }

    async execute(): Promise<SystemConfig> {
        return this.systemRepository.getSystemConfig();
    }
}
