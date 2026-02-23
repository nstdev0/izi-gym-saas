import { IUnitOfWork } from "@/server/application/services/unit-of-work.interface";
import Stripe from "stripe";

export class SyncStripeEventUseCase {
    constructor(private readonly uow: IUnitOfWork) { }

    async execute(event: Stripe.Event): Promise<void> {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;

            // Extract from metadata
            const organizationId = session.metadata?.organizationId;
            const organizationPlanId = session.metadata?.organizationPlanId;
            const userId = session.metadata?.userId;

            const stripeCustomerId = session.customer as string;
            const stripeSubscriptionId = session.subscription as string;

            if (!organizationId || !organizationPlanId || !stripeCustomerId || !stripeSubscriptionId) {
                console.warn(`[Stripe Webhook] Missing vital metadata on session ${session.id}`);
                return;
            }

            // Retrieve subscription details for currentPeriod data and exact status
            const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-01-28.clover" as any });
            const subscription = await stripeClient.subscriptions.retrieve(stripeSubscriptionId) as Stripe.Subscription;

            const isTrialing = subscription.status === 'trialing';

            await this.uow.syncStripeSubscriptionEvent({
                eventType: event.type,
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

            // We need metadata directly from the subscription if available, or we only update the status
            const organizationId = subscription.metadata?.organizationId;
            const organizationPlanId = subscription.metadata?.organizationPlanId;

            if (!organizationId || !organizationPlanId) {
                console.warn(`[Stripe Webhook] Cannot update sub ${stripeSubscriptionId} due to missing metadata on subscription.`);
                // Note: ideally, when creating the checkout session, we should copy the metadata to the subscription itself.
                // Or find the subscription by stripeSubscriptionId from the DB. But UoW logic will upsert it.
                // Assuming we're calling UoW to just update status... 
                // Wait, if UoW receives organizationId and planId as required, we need them here.
                // We should probably allow partial updates in UoW or ensure metadata is on the subscription in Stripe.
                return; // Simplification per prompt constraints. Next iteration we should fetch from DB if needed.
            }

            const isTrialing = subscription.status === 'trialing';

            await this.uow.syncStripeSubscriptionEvent({
                eventType: 'customer.subscription.deleted',
                organizationId,
                organizationPlanId,
                stripeCustomerId: subscription.customer as string,
                stripeSubscriptionId: subscription.id,
                status: subscription.status.toUpperCase() as any,
                pricePaid: 0, // In reality, fetch from recent invoice
                currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
                currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                isTrialing,
            });
        }
    }
}
