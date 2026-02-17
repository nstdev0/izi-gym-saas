import { auth } from "@clerk/nextjs/server";
import { BadRequestError, ForbiddenError } from "@/server/domain/errors/common";
import { prisma } from "@/server/infrastructure/persistence/prisma";
import { Role } from "@/generated/prisma/client";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { IDeleteUserUseCase } from "@/server/application/use-cases/users/delete-user.use-case";

const ALLOWED_ROLES: Role[] = [Role.GOD, Role.OWNER];

export class DeleteUserController implements ControllerExecutor<void, void> {
  constructor(private readonly useCase: IDeleteUserUseCase) { }

  async execute(_input: void, id?: string) {
    if (!id) {
      throw new BadRequestError("No se proporcionó un id");
    }
    const session = await auth();

    if (!session.userId) {
      throw new ForbiddenError("No autenticado");
    }

    if (session.userId === id) {
      throw new ForbiddenError("No puedes eliminar tu propia cuenta");
    }
    const currentUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true },
    });

    if (!currentUser || !ALLOWED_ROLES.includes(currentUser.role)) {
      throw new ForbiddenError("No tienes permisos para eliminar usuarios");
    }

    await this.useCase.execute(id);
  }
}
