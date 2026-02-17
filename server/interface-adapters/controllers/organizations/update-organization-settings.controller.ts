import { ControllerExecutor } from "@/server/lib/api-handler";
import { UpdateOrganizationSettingsUseCase } from "@/server/application/use-cases/organizations/update-organization-settings.use-case";
import { UpdateOrganizationSettingsInput } from "@/shared/types/organizations.types";

export class UpdateOrganizationSettingsController implements ControllerExecutor<UpdateOrganizationSettingsInput, void> {
    constructor(
        private readonly useCase: UpdateOrganizationSettingsUseCase,
    ) { }

    async execute(input: UpdateOrganizationSettingsInput): Promise<void> {
        await this.useCase.execute(input);
    }
}
