import { IUnitOfWork } from "@/server/application/services/unit-of-work.interface";
import Stripe from "stripe";

export class SyncStripeEventUseCase {
    constructor(private readonly uow: IUnitOfWork) { }

    async execute(event: Stripe.Event): Promise<void> {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;

            const organizationId = session.metadata?.organizationId;
            const organizationPlanId = session.metadata?.organizationPlanId;
            const userId = session.metadata?.userId;

            const stripeCustomerId = session.customer as string;
            const stripeSubscriptionId = session.subscription as string;

            if (!organizationId || !organizationPlanId || !stripeCustomerId || !stripeSubscriptionId) {
                console.warn(`[Stripe Webhook] Missing vital metadata on session ${session.id}`);
                return;
            }

            const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-01-28.clover" as any });
            const subscription = await stripeClient.subscriptions.retrieve(stripeSubscriptionId) as Stripe.Subscription;

            const isTrialing = subscription.status === 'trialing';

            await this.uow.syncStripeSubscriptionEvent({
                eventType: 'checkout.session.completed',
                organizationId,
                organizationPlanId,
                stripeCustomerId,
                stripeSubscriptionId,
                status: subscription.status.toUpperCase() as any,
                pricePaid: (session.amount_total || 0) / 100,
                currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
                currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                userId,
                isTrialing,
            });
        }

        if (event.type === 'invoice.payment_succeeded' || event.type === 'customer.subscription.deleted') {
            const invoiceOrSub = event.data.object as any;
            const stripeSubscriptionId = event.type === 'invoice.payment_succeeded' ? invoiceOrSub.subscription : invoiceOrSub.id;

            if (!stripeSubscriptionId) return;

            const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-01-28.clover" as any });
            const subscription = await stripeClient.subscriptions.retrieve(stripeSubscriptionId as string) as Stripe.Subscription;

            const organizationId = subscription.metadata?.organizationId;
            const organizationPlanId = subscription.metadata?.organizationPlanId;

            if (!organizationId || !organizationPlanId) {
                console.warn(`[Stripe Webhook] Cannot update sub ${stripeSubscriptionId} due to missing metadata on subscription.`);
                return;
            }

            const isTrialing = subscription.status === 'trialing';

            await this.uow.syncStripeSubscriptionEvent({
                eventType: event.type as 'invoice.payment_succeeded' | 'customer.subscription.deleted',
                organizationId,
                organizationPlanId,
                stripeCustomerId: subscription.customer as string,
                stripeSubscriptionId: subscription.id,
                status: subscription.status.toUpperCase() as any,
                pricePaid: 0,
                currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
                currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                isTrialing,
            });
        }
    }
}
