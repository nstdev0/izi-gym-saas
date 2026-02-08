import { SystemGetRecentSignupsUseCase } from "@/server/application/use-cases/system/system-get-recent-signups.use-case";
import { Organization } from "@/server/domain/entities/Organization";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class SystemGetRecentSignupsController implements ControllerExecutor<void, Organization[]> {
    constructor(private useCase: SystemGetRecentSignupsUseCase) { }

    async execute(): Promise<Organization[]> {
        return this.useCase.execute();
    }
}
