import { ISystemRepository } from "../../repositories/system.repository.interface";

export class SystemGetSystemConfigUseCase {
    constructor(private systemRepository: ISystemRepository) { }

    async execute(): Promise<any> {
        return this.systemRepository.getSystemConfig();
    }
}
