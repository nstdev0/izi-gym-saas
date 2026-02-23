import { BadRequestError, ConflictError, NotFoundError } from "@/server/domain/errors/common";
import { Role } from "@/shared/types/users.types";
import { SubscriptionStatus } from "@/shared/types/subscription.types";
import { CreateOrganizationInput } from "@/server/domain/types/organizations";
import { IOrganizationRepository } from "../../repositories/organizations.repository.interface";
import { IPlansRepository } from "../../repositories/plans.repository.interface";
import { IUsersRepository } from "../../repositories/users.repository.interface";
import { IAuthProvider } from "../../services/auth-provider.interface";
import { IUnitOfWork } from "../../services/unit-of-work.interface";
import { defaultOrganizationConfig } from "@/server/domain/value-objects/organizations-config.default";

export class CreateOrganizationUseCase {
  constructor(
    private readonly plansRepo: IPlansRepository,
    private readonly organizationsRepo: IOrganizationRepository,
    private readonly usersRepo: IUsersRepository,
    private readonly authProvider: IAuthProvider,
    private readonly unitOfWork: IUnitOfWork,
  ) { }

  async execute(input: CreateOrganizationInput, userId: string): Promise<void> {
    // ── 1. Business Validations ──────────────────────────────
    const plan = await this.plansRepo.findBySlug(input.planSlug ?? "free-trial")
    if (!plan) throw new NotFoundError(`El plan '${input.planSlug}' no existe`)

    const existingOrg = await this.organizationsRepo.findBySlug(input.slug)
    if (existingOrg) throw new ConflictError("Este URL ya está en uso")

    const existingUser = await this.usersRepo.findUnique({ id: userId })

    let ownerData: any;
    let isNewUser: boolean;

    if (!existingUser) {
      const authUser = await this.authProvider.getUserById(userId)
      if (!authUser?.email) throw new BadRequestError("Usuario no registrado")

      ownerData = {
        id: userId,
        email: authUser.email,
        image: authUser.imageUrl,
        role: Role.OWNER,
        isActive: true,
      };
      isNewUser = true;
    } else {
      ownerData = {
        id: userId,
        data: { organizationId: "", role: Role.OWNER },
      };
      isNewUser = false;
    }

    // ── 2. Delegate Transactional Write to UoW ───────────────
    await this.unitOfWork.createOrganizationWithOwner({
      orgData: {
        ...input,
        planId: plan.id,
        planName: plan.name,
        config: defaultOrganizationConfig(),
      },
      subscriptionData: {
        organizationId: "", // Set by UoW inside transaction
        planId: plan.id,
        status: SubscriptionStatus.TRIALING,
        pricePaid: 0,
        currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
      ownerData,
      isNewUser,
    });
  }
}

export type ICreateOrganizationUseCase = InstanceType<typeof CreateOrganizationUseCase>;