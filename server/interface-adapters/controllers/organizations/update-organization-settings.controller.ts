import { auth } from "@clerk/nextjs/server";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { UpdateOrganizationSettingsUseCase } from "@/server/application/use-cases/organizations/update-organization-settings.use-case";
import { UpdateOrganizationSettingsInput } from "@/server/application/dtos/organizations.dto";
import { Organization } from "@/server/domain/entities/Organization";
import { ForbiddenError } from "@/server/domain/errors/common";

export class UpdateOrganizationSettingsController implements ControllerExecutor<UpdateOrganizationSettingsInput, Organization> {
    constructor(private readonly useCase: UpdateOrganizationSettingsUseCase) { }

    async execute(input: UpdateOrganizationSettingsInput) {
        const session = await auth();

        if (!session.userId || !session.orgId) {
            throw new ForbiddenError("No autenticado o sin organización");
        }

        // Ensure user is admin/owner logic could be here or in middleware
        // For now, checks orgId presence

        return await this.useCase.execute(
            session.orgId,
            input,
        );
    }
}
