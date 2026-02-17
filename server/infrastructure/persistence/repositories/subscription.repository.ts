import { Prisma } from "@/generated/prisma/client";
import { BaseRepository } from "./base.repository";
import { Subscription } from "@/server/domain/entities/Subscription";
import { CreateSubscriptionInput, SubscriptionsFilters, UpdateSubscriptionInput } from "@/server/domain/types/subscription";
import { ISubscriptionRepository } from "@/server/application/repositories/subscription.repository.interface";
import { SubscriptionMapper } from "../mappers/subscription.mapper";
import { translatePrismaError } from "../prisma-error-translator";

export class SubscriptionRepository
    extends BaseRepository<
        Prisma.SubscriptionDelegate,
        Subscription,
        CreateSubscriptionInput,
        UpdateSubscriptionInput,
        SubscriptionsFilters
    >
    implements ISubscriptionRepository {
    constructor(
        protected readonly subscriptionModel: Prisma.SubscriptionDelegate,
        protected readonly organizationId: string
    ) {
        super(subscriptionModel, new SubscriptionMapper(), organizationId, "Suscripción");
    }

    async findByOrganizationId(organizationId: string): Promise<Subscription | null> {
        try {
            const record = await this.subscriptionModel.findUnique({
                where: { organizationId },
            });
            return record ? this.mapper.toDomain(record) : null;
        } catch (error) {
            translatePrismaError(error, "Suscripción")
        }
    }

    async findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription | null> {
        try {
            const record = await this.subscriptionModel.findUnique({
                where: { stripeSubscriptionId },
            });
            return record ? this.mapper.toDomain(record) : null;
        } catch (error) {
            translatePrismaError(error, "Suscripción")
        }
    }

    protected async buildPrismaClauses(filters: SubscriptionsFilters): Promise<[Prisma.SubscriptionWhereInput, Prisma.SubscriptionOrderByWithRelationInput]> {
        const where: Prisma.SubscriptionWhereInput = {};
        const orderBy: Prisma.SubscriptionOrderByWithRelationInput = { createdAt: "desc" };

        if (filters.organizationId) {
            where.organizationId = filters.organizationId;
        }

        if (filters.status) {
            where.status = filters.status;
        }

        return [where, orderBy];
    }
}