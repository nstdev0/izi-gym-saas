import { IRestorePlanUseCase } from "@/server/application/use-cases/plans/restore-plan.use-case";
import { BadRequestError } from "@/server/domain/errors/common";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class RestorePlanController implements ControllerExecutor<void, void> {
    constructor(private readonly useCase: IRestorePlanUseCase) { }

    async execute(_input: void, id?: string) {
        if (!id) {
            throw new BadRequestError("No se proporcionó un ID");
        }
        await this.useCase.execute(id);
    }
}
