import { ISystemSuspendOrganizationUseCase } from "@/server/application/use-cases/system/system-suspend-organization.use-case";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class SystemSuspendOrganizationController implements ControllerExecutor<{
    organizationId: string;
    suspend: boolean;
}, void> {
    constructor(private readonly suspendOrganizationUseCase: ISystemSuspendOrganizationUseCase) { }

    async execute(input: {
        organizationId: string;
        suspend: boolean;
    }, id?: string | undefined): Promise<void> {
        await this.suspendOrganizationUseCase.execute(input.organizationId, input.suspend);
    }
}
