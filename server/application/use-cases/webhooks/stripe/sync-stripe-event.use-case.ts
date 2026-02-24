import { IUnitOfWork } from "@/server/application/services/unit-of-work.interface";
import { IBillingProvider } from "@/server/application/services/billing-provider.interface";

export class SyncStripeEventUseCase {
    constructor(
        private readonly uow: IUnitOfWork,
        private readonly billingProvider: IBillingProvider
    ) { }

    async execute(event: any): Promise<void> {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;

            const organizationId = session.metadata?.organizationId;
            const organizationPlanId = session.metadata?.organizationPlanId;
            const userId = session.metadata?.userId;

            const stripeCustomerId = session.customer as string;
            const stripeSubscriptionId = session.subscription as string;

            if (!organizationId || !organizationPlanId || !stripeCustomerId || !stripeSubscriptionId) {
                console.warn(`[Stripe Webhook] Missing vital metadata on session ${session.id}`);
                return;
            }

            const subscription = await this.billingProvider.getSubscriptionInfo(stripeSubscriptionId);
            if (!subscription) return;

            await this.uow.syncStripeSubscriptionEvent({
                eventType: 'checkout.session.completed',
                organizationId,
                organizationPlanId,
                stripeCustomerId,
                stripeSubscriptionId,
                status: subscription.status as any,
                pricePaid: (session.amount_total || 0) / 100,
                currentPeriodStart: subscription.currentPeriodStart,
                currentPeriodEnd: subscription.currentPeriodEnd,
                cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
                userId,
                isTrialing: subscription.isTrialing,
            });
        }

        if (event.type === 'invoice.payment_succeeded' || event.type === 'customer.subscription.deleted') {
            const invoiceOrSub = event.data.object as any;
            const stripeSubscriptionId = event.type === 'invoice.payment_succeeded' ? invoiceOrSub.subscription : invoiceOrSub.id;

            if (!stripeSubscriptionId) return;

            const subscription = await this.billingProvider.getSubscriptionInfo(stripeSubscriptionId);
            if (!subscription) return;

            const organizationId = subscription.metadata?.organizationId;
            const organizationPlanId = subscription.metadata?.organizationPlanId;

            if (!organizationId || !organizationPlanId) {
                console.warn(`[Stripe Webhook] Cannot update sub ${stripeSubscriptionId} due to missing metadata on subscription.`);
                return;
            }

            await this.uow.syncStripeSubscriptionEvent({
                eventType: event.type as 'invoice.payment_succeeded' | 'customer.subscription.deleted',
                organizationId,
                organizationPlanId,
                stripeCustomerId: subscription.customerId,
                stripeSubscriptionId: subscription.id,
                status: subscription.status as any,
                pricePaid: 0,
                currentPeriodStart: subscription.currentPeriodStart,
                currentPeriodEnd: subscription.currentPeriodEnd,
                cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
                isTrialing: subscription.isTrialing,
            });
        }
    }
}
