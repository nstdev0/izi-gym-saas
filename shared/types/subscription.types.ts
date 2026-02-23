export enum SubscriptionStatus {
    ACTIVE = "ACTIVE",
    PAST_DUE = "PAST_DUE",
    CANCELED = "CANCELED",
    TRIALING = "TRIALING",
    INCOMPLETE = "INCOMPLETE",
}

export interface Subscription {
    id: string;
    organizationId: string;
    status: SubscriptionStatus;
    planId: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date | null;
    cancelAtPeriodEnd: boolean;
}
