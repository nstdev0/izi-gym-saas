import { Subscription } from "@/server/domain/entities/Subscription";
import {
    CreateSubscriptionInput,
    UpdateSubscriptionInput,
    SubscriptionsFilters,
} from "@/server/domain/types/subscription";
import { IBaseRepository } from "./base.repository.interface";

export interface ISubscriptionRepository
    extends IBaseRepository<
        Subscription,
        CreateSubscriptionInput,
        UpdateSubscriptionInput,
        SubscriptionsFilters
    > {
    findByOrganizationId(organizationId: string): Promise<Subscription | null>;
    findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription | null>;
}
