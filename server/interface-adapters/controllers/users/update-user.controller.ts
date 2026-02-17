import { IUpdateUserUseCase } from "@/server/application/use-cases/users/update-user.use-case";
import { ForbiddenError, BadRequestError } from "@/server/domain/errors/common";
import { UpdateUserInput } from "@/server/domain/types/users";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/server/infrastructure/persistence/prisma";
import { Role } from "@/generated/prisma/client";
import { ControllerExecutor } from "@/server/lib/api-handler";

const ALLOWED_ROLES: Role[] = [Role.GOD, Role.OWNER];

export class UpdateUserController implements ControllerExecutor<UpdateUserInput, void> {
  constructor(private readonly useCase: IUpdateUserUseCase) { }

  async execute(input: UpdateUserInput, id?: string) {
    if (!id) {
      throw new BadRequestError("ID requerido", "No se proporcionó el ID del usuario a actualizar");
    }

    const session = await auth();

    if (!session.userId) {
      throw new ForbiddenError("No autenticado");
    }

    // Check current user's role
    const currentUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true },
    });

    if (!currentUser || !ALLOWED_ROLES.includes(currentUser.role)) {
      throw new ForbiddenError("No tienes permisos para actualizar usuarios");
    }

    await this.useCase.execute(
      id,
      input,
    );
  }
}
