import { UsersRepository } from "@/server/infrastructure/persistence/repositories/users.repository";
import { ClerkAuthService } from "@/server/infrastructure/services/clerk-auth.service";
import { GetAllUsersUseCase } from "@/server/application/use-cases/users/get-all-users.use-case";
import { CreateUserUseCase } from "@/server/application/use-cases/users/create-user.use-case";
import { GetUserByIdUseCase } from "@/server/application/use-cases/users/get-user-by-id.use-case";
import { UpdateUserUseCase } from "@/server/application/use-cases/users/update-user.use-case";
import { DeleteUserUseCase } from "@/server/application/use-cases/users/delete-user.use-case";
import { RestoreUserUseCase } from "@/server/application/use-cases/users/restore-user.use-case";
import { GetAllUsersController } from "@/server/interface-adapters/controllers/users/get-all-users.controller";
import { CreateUserController } from "@/server/interface-adapters/controllers/users/create-user.controller";
import { GetUserByIdController } from "@/server/interface-adapters/controllers/users/get-user-by-id.controller";
import { UpdateUserController } from "@/server/interface-adapters/controllers/users/update-user.controller";
import { DeleteUserController } from "@/server/interface-adapters/controllers/users/delete-user.controller";
import { RestoreUserController } from "@/server/interface-adapters/controllers/users/restore-user.controller";
import { PrismaClient } from "@/generated/prisma/client";

export function createUsersModule(prisma: PrismaClient, tenantId: string) {
    const usersRepository = new UsersRepository(prisma.user, tenantId);
    const clerkAuthService = new ClerkAuthService();

    const getAllUsersUseCase = new GetAllUsersUseCase(usersRepository);
    const createUserUseCase = new CreateUserUseCase(clerkAuthService);
    const getUserByIdUseCase = new GetUserByIdUseCase(usersRepository);
    const updateUserUseCase = new UpdateUserUseCase(usersRepository);
    const deleteUserUseCase = new DeleteUserUseCase(usersRepository);
    const restoreUserUseCase = new RestoreUserUseCase(usersRepository);

    const getAllUsersController = new GetAllUsersController(getAllUsersUseCase);
    const createUserController = new CreateUserController(createUserUseCase);
    const getUserByIdController = new GetUserByIdController(getUserByIdUseCase);
    const updateUserController = new UpdateUserController(updateUserUseCase);
    const deleteUserController = new DeleteUserController(deleteUserUseCase);
    const restoreUserController = new RestoreUserController(restoreUserUseCase);

    return {
        getAllUsersController,
        createUserController,
        getUserByIdController,
        updateUserController,
        deleteUserController,
        restoreUserController,
    };
}
