import { NextResponse } from "next/server";
import { UpdateOrganizationSettingsUseCase } from "@/server/application/use-cases/organization/update-organization-settings.use-case";
import { auth } from "@clerk/nextjs/server";
import { UpdateOrganizationSettingsInput } from "@/server/application/dtos/organizations.dto";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class UpdateOrganizationSettingsController implements ControllerExecutor<UpdateOrganizationSettingsInput, any> {
    constructor(private useCase: UpdateOrganizationSettingsUseCase) { }

    async execute(input: UpdateOrganizationSettingsInput): Promise<any> {
        const { orgId } = await auth();

        if (!orgId) {
            throw new Error("Unauthorized: Missing Organization ID");
        }

        return this.useCase.execute(orgId, input);
    }
}
