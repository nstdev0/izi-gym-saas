import { IRestoreMembershipUseCase } from "@/server/application/use-cases/memberships/restore-membership.use-case";
import { BadRequestError } from "@/server/domain/errors/common";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class RestoreMembershipController implements ControllerExecutor<void, void> {
    constructor(private readonly useCase: IRestoreMembershipUseCase) { }

    async execute(_input: void, id?: string) {
        if (!id) {
            throw new BadRequestError("No se proporciono un id");
        }
        await this.useCase.execute(id);
    }
}
