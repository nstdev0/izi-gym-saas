import { IRestoreUserUseCase } from "@/server/application/use-cases/users/restore-user.use-case";
import { BadRequestError, NotFoundError } from "@/server/domain/errors/common";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class RestoreUserController implements ControllerExecutor<void, void> {
    constructor(private readonly useCase: IRestoreUserUseCase) { }

    async execute(_input: void, id?: string) {
        if (!id) {
            throw new BadRequestError("No se proporcionó un ID");
        }
        await this.useCase.execute(id);
    }
}
