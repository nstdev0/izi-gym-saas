import { ISystemRepository } from "@/server/application/repositories/system.repository.interface";

export interface ISystemSuspendOrganizationUseCase {
    execute(organizationId: string, suspend: boolean): Promise<void>;
}

export class SystemSuspendOrganizationUseCase implements ISystemSuspendOrganizationUseCase {
    constructor(private readonly systemRepository: ISystemRepository) { }

    async execute(organizationId: string, suspend: boolean): Promise<void> {
        await this.systemRepository.suspendOrganization(organizationId, suspend);
    }
}
