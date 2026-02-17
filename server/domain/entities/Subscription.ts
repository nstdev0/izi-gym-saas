import { BaseEntity, EntityStatus } from "./_base";
import { SubscriptionStatus } from "@/generated/prisma/client";

export class Subscription extends BaseEntity {
    constructor(
        id: string,
        organizationId: string,
        createdAt: Date,
        updatedAt: Date,
        status: EntityStatus,
        deletedAt: Date | null,
        public organizationPlanId: string,
        public stripeCustomerId: string | null,
        public stripeSubscriptionId: string | null,
        public subscriptionStatus: SubscriptionStatus,
        public currentPeriodEnd: Date,
        public pricePaid: number,
    ) {
        super(id, organizationId, createdAt, updatedAt, status, deletedAt);
    }
}
