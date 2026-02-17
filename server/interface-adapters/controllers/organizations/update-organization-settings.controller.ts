import { auth } from "@clerk/nextjs/server";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { UpdateOrganizationSettingsUseCase } from "@/server/application/use-cases/organizations/update-organization-settings.use-case";
import { UpdateOrganizationSettingsInput } from "@/server/application/dtos/organizations.dto";
import { ForbiddenError } from "@/server/domain/errors/common";

export class UpdateOrganizationSettingsController implements ControllerExecutor<UpdateOrganizationSettingsInput, void> {
    constructor(private readonly useCase: UpdateOrganizationSettingsUseCase) { }

    async execute(input: UpdateOrganizationSettingsInput): Promise<void> {
        const session = await auth();

        if (!session.userId || !session.orgId) {
            throw new ForbiddenError("No autenticado o sin organización");
        }

        await this.useCase.execute(session.orgId, input);
    }
}
