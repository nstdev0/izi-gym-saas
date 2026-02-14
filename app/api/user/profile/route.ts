import { UpdateUserUseCase } from "@/server/application/use-cases/users/update-user.use-case";
import { UpdateProfileController } from "@/server/interface-adapters/controllers/users/update-profile.controller";
import { prisma } from "@/server/infrastructure/persistence/prisma";
import { UsersRepository } from "@/server/infrastructure/persistence/repositories/users.repository";
import { createContext } from "@/server/lib/api-handler";
import { UpdateUserSchema } from "@/server/application/dtos/users.dto";

const usersRepository = new UsersRepository(prisma.user);
const useCase = new UpdateUserUseCase(usersRepository);
const controller = new UpdateProfileController(useCase);

const requestMapper = async (req: Request) => {
    const body = await req.json();
    return UpdateUserSchema.parse(body);
};

export const PATCH = createContext(() => controller, requestMapper);
