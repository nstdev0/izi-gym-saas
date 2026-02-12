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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    }, id?: string | undefined) {
        return this.suspendOrganizationUseCase.execute(input.organizationId, input.suspend);
    }
}
