import { BadRequestError, ConflictError, NotFoundError } from "@/server/domain/errors/common";
import { CreateOrganizationInput } from "@/server/domain/types/organizations";
import { clerkClient } from "@clerk/nextjs/server";
import { IOrganizationRepository } from "../../repositories/organizations.repository.interface";
import { IPlansRepository } from "../../repositories/plans.repository.interface";
import { IUsersRepository } from "../../repositories/users.repository.interface";
import { ISubscriptionRepository } from "../../repositories/subscription.repository.interface";
import { IAuthProvider } from "../../services/auth-provider.interface";
import { defaultOrganizationConfig } from "@/server/domain/value-objects/organizations-config.default";

export class CreateOrganizationUseCase {
  constructor(
    private readonly organizationRepo: IOrganizationRepository,
    private readonly planRepo: IPlansRepository,
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly userRepo: IUsersRepository,
    private readonly authProvider: IAuthProvider,
  ) { }

  async execute(input: CreateOrganizationInput, userId: string): Promise<void> {
    // 1. Validaciones de negocio puras
    const plan = await this.planRepo.findBySlug(input.planSlug ?? "free-trial")
    if (!plan) throw new NotFoundError(`El plan '${input.planSlug}' no existe`)

    const existingOrg = await this.organizationRepo.findBySlug(input.slug)
    if (existingOrg) throw new ConflictError("Este URL ya está en uso")

    // 2. Crear la organización (el repo maneja la transacción internamente)
    const org = await this.organizationRepo.create({
      ...input,
      planId: plan.id,
      planName: plan.name,
      config: defaultOrganizationConfig(),
    })

    // 3. Crear suscripción
    await this.subscriptionRepo.create({
      organizationId: org.id,
      planId: plan.id,
      status: "TRIALING",
      pricePaid: 0,
      currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    })

    // 4. Asociar usuario dueño
    const existingUser = await this.userRepo.findUnique({ id: userId })

    if (!existingUser) {
      const authUser = await this.authProvider.getUserById(userId)
      if (!authUser?.email) throw new BadRequestError("Usuario no registrado")

      await this.userRepo.create({
        id: userId,
        email: authUser.email,
        image: authUser.imageUrl,
        role: "OWNER",
        organizationId: org.id,
        isActive: true,
      })
    } else {
      await this.userRepo.update(userId, {
        organizationId: org.id,
        role: "OWNER",
      })
    }
  }
}

export type ICreateOrganizationUseCase = InstanceType<typeof CreateOrganizationUseCase>;