import { ICancelMembershipUseCase } from "@/server/application/use-cases/memberships/cancel-membership.use-case";
import { BadRequestError } from "@/server/domain/errors/common";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class CancelMembershipController implements ControllerExecutor<void, void> {
    constructor(private readonly useCase: ICancelMembershipUseCase) { }

    async execute(_input: void, id?: string): Promise<void> {
        if (!id) throw new BadRequestError("Id is required");

        await this.useCase.execute(id);
    }
}