import { IOrganizationRepository } from "@/server/application/repositories/organizations.repository.interface";
import { IUsersRepository } from "@/server/application/repositories/users.repository.interface";
import { ISystemRepository } from "@/server/application/repositories/system.repository.interface";
import { IBillingProvider } from "@/server/application/services/billing-provider.interface";
import { NotFoundError, ValidationError } from "@/server/domain/errors/common";

export class CreateCheckoutSessionUseCase {
    constructor(
        private readonly organizationsRepository: IOrganizationRepository,
        private readonly usersRepository: IUsersRepository,
        private readonly systemRepository: ISystemRepository,
        private readonly billingProvider: IBillingProvider
    ) { }

    async execute(organizationId: string, planSlug: string, userId: string) {
        const user = await this.usersRepository.findById(userId);
        if (!user) throw new NotFoundError("Usuario no encontrado");

        const organization = await this.organizationsRepository.findById(organizationId);
        if (!organization) throw new NotFoundError("Organización no encontrada");

        const plan = await this.systemRepository.getPlanBySlug(planSlug);
        if (!plan) throw new NotFoundError("Plan no encontrado");
        if (!plan.stripePriceId) throw new ValidationError("Plan no tiene Stripe Price configurado");

        const isTrialEligible =
            (plan.slug.startsWith("pro") || plan.slug.startsWith("enterprise")) &&
            user.hasUsedTrial === false;

        return await this.billingProvider.createCheckoutSession({
            organizationId: organization.id,
            organizationSlug: organization.slug,
            organizationPlanId: plan.id,
            userId: user.id,
            userEmail: user.email,
            planStripePriceId: plan.stripePriceId,
            isTrialEligible,
            stripeCustomerId: organization.subscription?.stripeCustomerId
        });
    }
}