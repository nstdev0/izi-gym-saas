import { UpdateOrganizationSettingsUseCase } from "@/server/application/use-cases/organization/update-organization-settings.use-case";
import { auth } from "@clerk/nextjs/server";
import { UpdateOrganizationSettingsInput } from "@/server/application/dtos/organizations.dto";
import { ControllerExecutor } from "@/server/lib/api-handler";

import { Organization } from "@/generated/prisma/client";

export class UpdateOrganizationSettingsController implements ControllerExecutor<UpdateOrganizationSettingsInput, Organization> {
    constructor(private useCase: UpdateOrganizationSettingsUseCase) { }

    async execute(input: UpdateOrganizationSettingsInput): Promise<Organization> {
        const { orgId } = await auth();

        if (!orgId) {
            throw new Error("Unauthorized: Missing Organization ID");
        }

        return this.useCase.execute(orgId, input);
    }
}
