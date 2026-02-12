import { IUsersRepository } from "@/server/application/repositories/users.repository.interface";
import { CreateUserInput } from "@/server/domain/types/users";
import { User } from "@/server/domain/entities/User";
import { ClerkAuthService } from "@/server/infrastructure/services/clerk-auth.service";

export interface ICreateUserUseCase {
  execute(input: CreateUserInput, organizationId?: string, inviterId?: string): Promise<User>;
}

// OJO: Cambiamos la interfaz de retorno o devolvemos un objeto parcial compatible
// Para mantener compatibilidad con el Controller, devolvemos un objeto que simula User parcialmente o ajustamos el tipo.
// Lo más limpio es ajustar el tipo de retorno aquí y en el controller, pero para esta iteración devolvemos un "User" dummy.
export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(
    private repository: IUsersRepository,
    private authService: ClerkAuthService
  ) { }

  async execute(input: CreateUserInput, organizationId?: string, inviterId?: string): Promise<User> {
    // 1. Invitar en Clerk a la Organización
    const orgId = organizationId || "";
    // inviterId es obligatorio para org invites, podría venir del controller
    if (!inviterId) {
      throw new Error("Se requiere ID del invitador para invitaciones de organización");
    }

    await this.authService.inviteUserToOrganization({
      email: input.email,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      role: input.role as any, // "ADMIN" | "STAFF" | "TRAINER"
      organizationId: orgId,
      inviterUserId: inviterId,
    });

    // 2. Retornar un objeto dummy para satisfacer la interfaz hasta que el webhook cree el real.
    // Esto es un compromiso temporal. El frontend refrescará y quizás no vea al usuario todavía.
    return {
      id: "pending_invitation",
      email: input.email,
      firstName: input.firstName || "",
      lastName: input.lastName || "",
      role: input.role,
      isActive: false,
      organizationId: orgId,
      createdAt: new Date(),
      updatedAt: new Date(),
      image: null,
    } as User;
  }
}
