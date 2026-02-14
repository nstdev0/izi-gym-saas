import { IOrganizationRepository } from "@/server/application/repositories/organizations.repository.interface";
import { UpdateOrganizationSettingsInput } from "@/server/application/dtos/organizations.dto";
import { Organization } from "@/server/domain/entities/Organization";

export class UpdateOrganizationSettingsUseCase {
    constructor(private readonly organizationsRepository: IOrganizationRepository) { }

    async execute(
        organizationId: string,
        input: UpdateOrganizationSettingsInput
    ): Promise<Organization> {
        return this.organizationsRepository.updateSettings(organizationId, input);
    }
}
