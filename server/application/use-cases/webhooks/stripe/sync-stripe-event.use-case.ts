import { IUnitOfWork } from "@/server/application/services/unit-of-work.interface";
import { IBillingProvider } from "@/server/application/services/billing-provider.interface";
import { prisma } from "@/server/infrastructure/persistence/prisma";

const FREE_PLAN_SLUG = 'free-trial';

export class SyncStripeEventUseCase {
    constructor(
        private readonly uow: IUnitOfWork,
        private readonly billingProvider: IBillingProvider
    ) { }

    private toDate(date: number | Date | string | undefined | null): Date {
        if (!date) return new Date();
        if (date instanceof Date) return date;
        if (typeof date === 'number') {
            return new Date(date > 9999999999 ? date : date * 1000);
        }
        return new Date(date);
    }

    async execute(event: any): Promise<void> {
        switch (event.type) {
            case 'checkout.session.completed':
                return this.handleCheckoutCompleted(event);

            case 'customer.subscription.updated':
                return this.handleSubscriptionUpdated(event);

            case 'customer.subscription.deleted':
                return this.handleSubscriptionDeleted(event);

            case 'invoice.payment_succeeded':
                return this.handleInvoicePaymentSucceeded(event);

            default:
                console.log(`[Stripe Sync] Unhandled event type: ${event.type}`);
        }
    }

    // ─── 1. Checkout Session Completed ──────────────────────────────────
    // First-time purchase or new subscription after cancellation.
    // Persists stripeCustomerId + stripeSubscriptionId on Organization.
    private async handleCheckoutCompleted(event: any): Promise<void> {
        const session = event.data.object;

        const organizationId = session.metadata?.organizationId;
        const organizationPlanId = session.metadata?.organizationPlanId;
        const userId = session.metadata?.userId;
        const stripeCustomerId = session.customer as string;
        const stripeSubscriptionId = session.subscription as string;

        console.log(`[Stripe Sync] checkout.session.completed — metadata:`, {
            organizationId, organizationPlanId, userId,
            stripeCustomerId, stripeSubscriptionId, sessionId: session.id,
        });

        if (!organizationId || !organizationPlanId || !stripeSubscriptionId) {
            console.warn(`[Stripe Sync] Faltan metadatos en session ${session.id}:`, {
                organizationId: !!organizationId,
                organizationPlanId: !!organizationPlanId,
                stripeSubscriptionId: !!stripeSubscriptionId,
            });
            return;
        }

        const subscription = await this.billingProvider.getSubscriptionInfo(stripeSubscriptionId);
        if (!subscription) {
            console.error(`[Stripe Sync] No se pudo obtener info de suscripción ${stripeSubscriptionId}`);
            return;
        }

        await this.uow.syncStripeSubscriptionEvent({
            eventType: 'checkout.session.completed',
            organizationId,
            organizationPlanId,
            stripeCustomerId,
            stripeSubscriptionId,
            status: subscription.status as any,
            pricePaid: (session.amount_total || 0) / 100,
            currentPeriodStart: this.toDate(subscription.currentPeriodStart),
            currentPeriodEnd: this.toDate(subscription.currentPeriodEnd),
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd ?? false,
            userId,
            isTrialing: subscription.isTrialing,
        });

        console.log(`[Stripe Sync] ✅ checkout.session.completed synced for org ${organizationId}`);
    }

    // ─── 2. Subscription Updated (Upgrade/Downgrade) ────────────────────
    // Stripe fires this when the plan changes. We resolve the new plan
    // from the price ID on the subscription item.
    private async handleSubscriptionUpdated(event: any): Promise<void> {
        const stripeSubscription = event.data.object as any;
        const stripeSubscriptionId = stripeSubscription.id;

        if (!stripeSubscriptionId) return;

        const subscription = await this.billingProvider.getSubscriptionInfo(stripeSubscriptionId);
        if (!subscription) return;

        // Extract metadata from subscription
        const organizationId = subscription.metadata?.organizationId || stripeSubscription.metadata?.organizationId;
        const userId = subscription.metadata?.userId || stripeSubscription.metadata?.userId;

        // Resolve the plan from the price ID on the subscription item
        let organizationPlanId = subscription.metadata?.organizationPlanId || stripeSubscription.metadata?.organizationPlanId;

        const priceId = stripeSubscription.items?.data?.[0]?.price?.id;
        if (priceId) {
            const plan = await prisma.organizationPlan.findFirst({
                where: { stripePriceId: priceId }
            });
            if (plan) {
                organizationPlanId = plan.id;
                console.log(`[Stripe Sync] Resolved priceId ${priceId} → plan ${plan.name} (${plan.id})`);
            }
        }

        if (!organizationId || !organizationPlanId) {
            console.warn(`[Stripe Sync] customer.subscription.updated — missing metadata for sub ${stripeSubscriptionId}`);
            return;
        }

        console.log(`[Stripe Sync] Processing customer.subscription.updated:`, {
            organizationId, organizationPlanId, stripeSubscriptionId,
            status: subscription.status,
        });

        await this.uow.syncStripeSubscriptionEvent({
            eventType: 'customer.subscription.updated',
            organizationId,
            organizationPlanId,
            stripeCustomerId: subscription.customerId || stripeSubscription.customer,
            stripeSubscriptionId,
            status: subscription.status as any,
            currentPeriodStart: this.toDate(subscription.currentPeriodStart),
            currentPeriodEnd: this.toDate(subscription.currentPeriodEnd),
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd ?? false,
            isTrialing: subscription.isTrialing,
            userId,
        });

        console.log(`[Stripe Sync] ✅ customer.subscription.updated synced for org ${organizationId}`);
    }

    // ─── 3. Subscription Deleted (Cancellation / Expiration) ────────────
    // Reverts the Organization to the free plan and clears the subscription ID.
    private async handleSubscriptionDeleted(event: any): Promise<void> {
        const stripeSubscription = event.data.object as any;
        const stripeSubscriptionId = stripeSubscription.id;

        if (!stripeSubscriptionId) return;

        // Get metadata from the deleted subscription
        const organizationId = stripeSubscription.metadata?.organizationId;
        const stripeCustomerId = stripeSubscription.customer as string;

        // Resolve the free plan
        const freePlan = await prisma.organizationPlan.findUnique({
            where: { slug: FREE_PLAN_SLUG }
        });

        if (!freePlan) {
            console.error(`[Stripe Sync] Free plan not found with slug "${FREE_PLAN_SLUG}"`);
            return;
        }

        if (!organizationId) {
            console.warn(`[Stripe Sync] customer.subscription.deleted — no organizationId in metadata for sub ${stripeSubscriptionId}`);
            return;
        }

        console.log(`[Stripe Sync] Processing customer.subscription.deleted:`, {
            organizationId, stripeSubscriptionId, revertToPlan: freePlan.name,
        });

        await this.uow.syncStripeSubscriptionEvent({
            eventType: 'customer.subscription.deleted',
            organizationId,
            organizationPlanId: freePlan.id,
            stripeCustomerId,
            stripeSubscriptionId,
            status: 'CANCELED' as any,
            currentPeriodStart: this.toDate(stripeSubscription.current_period_start),
            currentPeriodEnd: this.toDate(stripeSubscription.current_period_end),
            cancelAtPeriodEnd: false,
            isTrialing: false,
        });

        console.log(`[Stripe Sync] ✅ customer.subscription.deleted — org ${organizationId} reverted to ${freePlan.name}`);
    }

    // ─── 4. Invoice Payment Succeeded ───────────────────────────────────
    // Updates the paid price and confirms the subscription is active.
    private async handleInvoicePaymentSucceeded(event: any): Promise<void> {
        const invoice = event.data.object as any;
        const stripeSubscriptionId = invoice.subscription || invoice.parent?.subscription_details?.subscription;

        if (!stripeSubscriptionId) return;

        const subscription = await this.billingProvider.getSubscriptionInfo(stripeSubscriptionId);
        if (!subscription) return;

        const organizationId = subscription.metadata?.organizationId || invoice.parent?.subscription_details?.metadata?.organizationId;
        const userId = subscription.metadata?.userId;
        let organizationPlanId = subscription.metadata?.organizationPlanId || invoice.parent?.subscription_details?.metadata?.organizationPlanId;

        // Try to resolve from line item price
        const priceId = invoice.lines?.data?.[0]?.pricing?.price_details?.price || invoice.lines?.data?.[0]?.price?.id;
        if (priceId) {
            const plan = await prisma.organizationPlan.findFirst({
                where: { stripePriceId: priceId }
            });
            if (plan) {
                organizationPlanId = plan.id;
            }
        }

        if (!organizationId || !organizationPlanId) {
            console.warn(`[Stripe Sync] invoice.payment_succeeded — missing metadata for sub ${stripeSubscriptionId}`);
            return;
        }

        console.log(`[Stripe Sync] Processing invoice.payment_succeeded:`, {
            organizationId, organizationPlanId, amountPaid: (invoice.amount_paid || 0) / 100,
        });

        await this.uow.syncStripeSubscriptionEvent({
            eventType: 'invoice.payment_succeeded',
            organizationId,
            organizationPlanId,
            stripeCustomerId: subscription.customerId || invoice.customer,
            stripeSubscriptionId,
            status: subscription.status as any,
            pricePaid: (invoice.amount_paid || 0) / 100,
            currentPeriodStart: this.toDate(subscription.currentPeriodStart),
            currentPeriodEnd: this.toDate(subscription.currentPeriodEnd),
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd ?? false,
            isTrialing: subscription.isTrialing,
            userId,
        });

        console.log(`[Stripe Sync] ✅ invoice.payment_succeeded synced for org ${organizationId}`);
    }
}