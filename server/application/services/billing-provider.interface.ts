import { CreateCheckoutSessionInput, CheckoutSessionResult, SubscriptionInfo } from "@/server/domain/types/billing";

export interface IBillingProvider {
    createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CheckoutSessionResult>;
    getSubscriptionInfo(subscriptionId: string): Promise<SubscriptionInfo | null>;
}
