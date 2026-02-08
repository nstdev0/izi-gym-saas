import { ISystemRepository } from "../../repositories/system.repository.interface";

export class SystemUpdateSystemConfigUseCase {
    constructor(private systemRepository: ISystemRepository) { }

    async execute(data: any): Promise<void> {
        return this.systemRepository.updateSystemConfig(data);
    }
}
