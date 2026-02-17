import { IRestoreMemberUseCase } from "@/server/application/use-cases/members/restore-member.use-case";
import { BadRequestError } from "@/server/domain/errors/common";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class RestoreMemberController implements ControllerExecutor<void, void> {
    constructor(private readonly useCase: IRestoreMemberUseCase) { }

    async execute(_input: void, id?: string): Promise<void> {
        if (!id) {
            throw new BadRequestError("No se proporciono un id");
        }

        await this.useCase.execute(id);
    }
}
