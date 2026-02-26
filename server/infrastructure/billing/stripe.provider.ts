import Stripe from "stripe";
import { IBillingProvider } from "@/server/application/services/billing-provider.interface";
import { CreateCheckoutSessionInput, CheckoutSessionResult, SubscriptionInfo } from "@/server/domain/types/billing";

const getBaseUrl = () => {
    // 1. Si la definiste a mano en Vercel/Local (quitamos el slash final si lo tiene)
    if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
    }
    // 2. Variable automática de Vercel para Producción
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
        return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    }
    // 3. Variable automática de Vercel (Previews/Deployments)
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    // 4. Fallback seguro para desarrollo local
    return "http://localhost:3000";
};


export class StripeBillingProvider implements IBillingProvider {
    private client: Stripe;

    constructor() {
        this.client = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: "2026-01-28.clover" as any,
        });
    }

    async createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CheckoutSessionResult> {
        const baseUrl = getBaseUrl();

        const sessionParams: any = {
            payment_method_types: ["card"],
            line_items: [
                {
                    price: input.planStripePriceId,
                    quantity: 1,
                },
            ],
            mode: "subscription",
            success_url: `${baseUrl}/${input.organizationSlug}/admin/dashboard?checkout=success`,
            cancel_url: `${baseUrl}/${input.organizationSlug}/admin/dashboard?checkout=canceled`,
            metadata: {
                organizationId: input.organizationId,
                organizationPlanId: input.organizationPlanId,
                userId: input.userId,
            },
            subscription_data: {
                metadata: {
                    organizationId: input.organizationId,
                    organizationPlanId: input.organizationPlanId,
                    userId: input.userId,
                }
            },
            allow_promotion_codes: true,
        };

        if (input.stripeCustomerId) {
            sessionParams.customer = input.stripeCustomerId;
            sessionParams.customer_update = { name: "auto" };
        } else {
            sessionParams.client_reference_id = input.organizationId;
            sessionParams.customer_email = input.userEmail;
        }

        if (input.isTrialEligible) {
            sessionParams.subscription_data.trial_period_days = 14;
            sessionParams.payment_method_collection = "if_required";
        }

        const session = await this.client.checkout.sessions.create(sessionParams);
        return {
            url: session.url,
            id: session.id,
        };
    }

    async getSubscriptionInfo(subscriptionId: string): Promise<SubscriptionInfo | null> {
        try {
            const subscription = await this.client.subscriptions.retrieve(subscriptionId) as Stripe.Subscription;
            const sub = subscription as any;

            // In Stripe API 2026+, current_period_start/end moved to subscription items
            const firstItem = sub.items?.data?.[0];
            const periodStart = sub.current_period_start
                || firstItem?.current_period_start
                || firstItem?.period?.start;
            const periodEnd = sub.current_period_end
                || firstItem?.current_period_end
                || firstItem?.period?.end;

            return {
                id: subscription.id,
                status: subscription.status.toUpperCase(),
                currentPeriodStart: periodStart ? new Date(periodStart * 1000) : new Date(),
                currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : new Date(),
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                customerId: subscription.customer as string,
                isTrialing: subscription.status === 'trialing',
                metadata: subscription.metadata || {},
            };
        } catch (error) {
            console.error(`Failed to retrieve stripe subscription ${subscriptionId}`, error);
            return null;
        }
    }
}
