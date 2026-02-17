import { ICreateUserUseCase } from "@/server/application/use-cases/users/create-user.use-case";
import { ForbiddenError } from "@/server/domain/errors/common";
import { CreateUserInput } from "@/server/domain/types/users";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/server/infrastructure/persistence/prisma";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { Role } from "@/generated/prisma/client";

const ALLOWED_ROLES: Role[] = [Role.GOD, Role.OWNER, Role.ADMIN];

export class CreateUserController implements ControllerExecutor<CreateUserInput, void> {
  constructor(private readonly useCase: ICreateUserUseCase) { }

  async execute(input: CreateUserInput): Promise<void> {
    const session = await auth();

    if (!session.orgId) throw new Error("No organization selected");
    if (!session.userId) throw new Error("Unauthorized: inviter ID missing");

    const currentUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true },
    });

    if (!currentUser || !ALLOWED_ROLES.includes(currentUser.role)) {
      throw new ForbiddenError("No tienes permisos para crear usuarios");
    }
    await this.useCase.execute(input, session.orgId, session.userId);
  }
}
