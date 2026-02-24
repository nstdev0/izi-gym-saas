export interface CreateCheckoutSessionInput {
    organizationId: string;
    organizationSlug: string;
    organizationPlanId: string;
    userId: string;
    userEmail: string;
    planStripePriceId: string;
    isTrialEligible: boolean;
    stripeCustomerId?: string;
}

export interface CheckoutSessionResult {
    url: string | null;
    id: string;
}

export interface SubscriptionInfo {
    id: string;
    status: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    customerId: string;
    isTrialing: boolean;
    metadata?: Record<string, string>;
}
