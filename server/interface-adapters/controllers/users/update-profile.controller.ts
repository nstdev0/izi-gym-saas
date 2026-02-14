import { IUpdateUserUseCase } from "@/server/application/use-cases/users/update-user.use-case";
import { ValidationError, ForbiddenError } from "@/server/domain/errors/common";
import { UpdateUserInput } from "@/server/domain/types/users";
import { auth } from "@clerk/nextjs/server";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { User } from "@/server/domain/entities/User";

export class UpdateProfileController implements ControllerExecutor<UpdateUserInput, User> {
    constructor(private readonly useCase: IUpdateUserUseCase) { }

    async execute(input: UpdateUserInput) {
        const session = await auth();

        if (!session.userId) {
            throw new ForbiddenError("No autenticado");
        }

        // Allow user to update ONLY their own profile
        // We pass session.userId as the ID to update
        return await this.useCase.execute(
            session.userId,
            input,
        );
    }
}
