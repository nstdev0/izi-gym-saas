import { Subscription } from "@/server/domain/entities/Subscription";
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
            raw.status,
            raw.currentPeriodEnd,
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
            currentPeriodEnd: domain.currentPeriodEnd,
            pricePaid: domain.pricePaid,
            createdAt: domain.createdAt,
            updatedAt: domain.updatedAt,
            deletedAt: domain.deletedAt,
        };
    }
}
