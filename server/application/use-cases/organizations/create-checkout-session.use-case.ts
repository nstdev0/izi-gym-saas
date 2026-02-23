import { IOrganizationRepository } from "@/server/application/repositories/organizations.repository.interface";
import { IUsersRepository } from "@/server/application/repositories/users.repository.interface";
import { ISystemRepository } from "@/server/application/repositories/system.repository.interface";
import { stripeClient } from "@/server/infrastructure/billing/stripe.client";
import { NotFoundError, ValidationError } from "@/server/domain/errors/common";

export class CreateCheckoutSessionUseCase {
    constructor(
        private readonly organizationsRepository: IOrganizationRepository,
        private readonly usersRepository: IUsersRepository,
        private readonly systemRepository: ISystemRepository
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

        // Default params
        const sessionParams: any = {
            payment_method_types: ["card"],
            line_items: [
                {
                    price: plan.stripePriceId,
                    quantity: 1,
                },
            ],
            mode: "subscription",
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${organizationId}/admin/dashboard?checkout=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${organizationId}/admin/dashboard?checkout=canceled`,
            metadata: {
                organizationPlanId: plan.id,
                userId: user.id,
            },
            allow_promotion_codes: true,
        };

        // Customer or Reference ID
        if (organization.subscription?.stripeCustomerId) {
            sessionParams.customer = organization.subscription.stripeCustomerId;
            sessionParams.customer_update = { name: "auto" };
        } else {
            sessionParams.client_reference_id = organizationId;
            sessionParams.customer_email = user.email;
        }

        // Trial config
        if (isTrialEligible) {
            sessionParams.subscription_data = { trial_period_days: 14 };
            sessionParams.payment_method_collection = "if_required";
        }

        return await stripeClient.checkout.sessions.create(sessionParams);
    }
}
