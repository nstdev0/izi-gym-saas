import { IUsersRepository } from "@/server/application/repositories/users.repository.interface";
import { CreateUserInput } from "@/server/domain/types/users";
import { IAuthProvider } from "../../services/auth-provider.interface";

export interface ICreateUserUseCase {
  execute(input: CreateUserInput, organizationId?: string, inviterId?: string): Promise<void>;
}

// OJO: Cambiamos la interfaz de retorno o devolvemos un objeto parcial compatible
// Para mantener compatibilidad con el Controller, devolvemos un objeto que simula User parcialmente o ajustamos el tipo.
// Lo más limpio es ajustar el tipo de retorno aquí y en el controller, pero para esta iteración devolvemos un "User" dummy.
import { IPermissionService } from "@/server/application/services/permission.service.interface";
import { IEntitlementService } from "@/server/application/services/entitlement.service.interface";

export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(
    private authService: IAuthProvider,
    private readonly permissions: IPermissionService,
    private readonly entitlements: IEntitlementService,
  ) { }

  async execute(input: CreateUserInput, organizationId?: string, inviterId?: string): Promise<void> {
    this.permissions.require('users:create');
    await this.entitlements.requireLimit('staff');

    // 1. Invitar en Clerk a la Organización
    const orgId = organizationId || "";
    // inviterId es obligatorio para org invites, podría venir del controller
    if (!inviterId) {
      throw new Error("Se requiere ID del invitador para invitaciones de organización");
    }

    await this.authService.inviteUserToOrganization({
      email: input.email,
      role: input.role as any, // "ADMIN" | "STAFF" | "TRAINER"
      organizationId: orgId,
      inviterUserId: inviterId,
    });
  }
}
