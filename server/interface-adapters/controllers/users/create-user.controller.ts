import { ICreateUserUseCase } from "@/server/application/use-cases/users/create-user.use-case";
import { ForbiddenError } from "@/server/domain/errors/common";
import { CreateUserInput } from "@/server/domain/types/users";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/server/infrastructure/persistence/prisma";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { Role } from "@/generated/prisma/client";

const ALLOWED_ROLES: Role[] = [Role.GOD, Role.OWNER];

export class CreateUserController implements ControllerExecutor<CreateUserInput> {
  constructor(private useCase: ICreateUserUseCase) { }

  async execute(input: CreateUserInput) {
    // Obtener sesión para orgId, inviterId y verificación de rol
    const session = await auth();

    if (!session.orgId) throw new Error("No organization selected");
    if (!session.userId) throw new Error("Unauthorized: inviter ID missing");

    // Check current user's role
    const currentUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true },
    });

    if (!currentUser || !ALLOWED_ROLES.includes(currentUser.role)) {
      throw new ForbiddenError("No tienes permisos para crear usuarios");
    }

    return await this.useCase.execute(input, session.orgId, session.userId);
  }
}
