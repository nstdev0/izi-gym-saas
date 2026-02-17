import { ForbiddenError } from "@/server/domain/errors/common";
import { UpdateUserInput } from "@/server/domain/types/users";
import { auth } from "@clerk/nextjs/server";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { IUpdateUserUseCase } from "@/server/application/use-cases/users/update-user.use-case";

export class UpdateProfileController implements ControllerExecutor<UpdateUserInput, void> {
    constructor(private readonly useCase: IUpdateUserUseCase) { }

    async execute(input: UpdateUserInput) {
        const session = await auth();

        if (!session.userId) {
            throw new ForbiddenError("No autenticado");
        }
        await this.useCase.execute(
            session.userId,
            input,
        );
    }
}
