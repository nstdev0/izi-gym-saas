import { SubscriptionStatus } from "@/shared/types/subscription.types";

export interface CreateSubscriptionInput {
    organizationId: string;
    planId: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    status: SubscriptionStatus;
    currentPeriodEnd?: Date;
    pricePaid: number;
    trialDays?: number;
}

export type UpdateSubscriptionInput = Partial<CreateSubscriptionInput>;

export interface SubscriptionsFilters {
    status?: SubscriptionStatus;
    organizationId?: string;
}
