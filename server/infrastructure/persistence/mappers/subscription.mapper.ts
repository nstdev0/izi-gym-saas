import { Subscription } from "@/server/domain/entities/Subscription";
import { SubscriptionStatus } from "@/shared/types/subscription.types";
import { Subscription as PrismaSubscription, Prisma } from "@/generated/prisma/client";
import { IMapperInterface } from "./IMapper.interface";
import { EntityStatus } from "@/server/domain/entities/_base";

export class SubscriptionMapper implements IMapperInterface<Subscription, PrismaSubscription> {
    toDomain(raw: PrismaSubscription): Subscription {
        return new Subscription(
            raw.id,
            raw.organizationId,
            raw.createdAt,
            raw.updatedAt,
            // Mapping SubscriptionStatus to EntityStatus for BaseEntity compatibility roughly
            raw.status === "ACTIVE" || raw.status === "TRIALING" ? EntityStatus.ACTIVE : EntityStatus.INACTIVE,
            raw.deletedAt,
            raw.organizationPlanId,
            raw.stripeCustomerId,
            raw.stripeSubscriptionId,
            raw.status as unknown as SubscriptionStatus,
            raw.currentPeriodStart,
            raw.currentPeriodEnd,
            raw.cancelAtPeriodEnd,
            raw.pricePaid.toNumber()
        );
    }

    toPersistence(domain: Subscription): Prisma.SubscriptionUncheckedCreateInput {
        return {
            id: domain.id,
            organizationId: domain.organizationId,
            organizationPlanId: domain.organizationPlanId,
            stripeCustomerId: domain.stripeCustomerId,
            stripeSubscriptionId: domain.stripeSubscriptionId,
            status: domain.subscriptionStatus,
            currentPeriodStart: domain.currentPeriodStart,
            currentPeriodEnd: domain.currentPeriodEnd,
            cancelAtPeriodEnd: domain.cancelAtPeriodEnd,
            pricePaid: domain.pricePaid,
            createdAt: domain.createdAt,
            updatedAt: domain.updatedAt,
            deletedAt: domain.deletedAt,
        };
    }
}
