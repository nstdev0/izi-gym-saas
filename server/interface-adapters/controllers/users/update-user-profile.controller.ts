import { IUpdateUserUseCase } from "@/server/application/use-cases/users/update-user.use-case";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { UserResponseMapper } from "../../mappers/user-response.mapper";
import { UserResponse, UpdateUserInput } from "@/shared/types/users.types";
import { UserWithMembership } from "@/server/domain/entities/User";

export class UpdateUserProfileController implements ControllerExecutor<UpdateUserInput, UserResponse> {
    constructor(
        private readonly useCase: IUpdateUserUseCase,
        private readonly currentUserId: string
    ) { }

    async execute(input: UpdateUserInput): Promise<UserResponse> {
        const result = await this.useCase.execute(this.currentUserId, input);
        return UserResponseMapper.toResponse(result as UserWithMembership);
    }
}
