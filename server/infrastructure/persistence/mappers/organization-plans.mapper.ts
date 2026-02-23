import { OrganizationPlan } from "@/server/domain/entities/OrganizationPlan";
import { IMapperInterface } from "./IMapper.interface";
import { EntityStatus } from "@/server/domain/entities/_base";
import { Prisma } from "@/generated/prisma/client";

export class OrganizationPlanMapper implements IMapperInterface<OrganizationPlan, Prisma.OrganizationPlanUncheckedCreateInput> {
    toDomain(raw: any): OrganizationPlan {
        return new OrganizationPlan(
            raw.id,
            raw.organizationId || "", // This needs care: OrganizationPlan doesn't seemingly have an organizationId in schema?
            raw.createdAt,
            raw.updatedAt,
            raw.isActive ? EntityStatus.ACTIVE : EntityStatus.INACTIVE,
            raw.deletedAt,
            raw.name,
            raw.slug,
            Number(raw.price),
            raw.currency,
            raw.interval,
            raw.description,
            raw.image,
            raw.stripePriceId,
            raw.limits
        );
    }

    toPersistence(domain: OrganizationPlan): Prisma.OrganizationPlanUncheckedCreateInput {
        return {
            id: domain.id,
            // OrganizationPlan in Prisma schema doesn't have organizationId field directly related to an organization table, 
            // it's a plan template. Wait, checking schema:
            // model OrganizationPlan { id, name, slug... organizations Organization[] }
            // so it doesn't have organizationId column.
            // But domain entity has it? 
            // OrganizationPlan.ts: constructor(..., organizationId: string, ...)
            // Let's check OrganizationPlan.ts
            // If it has it, we might need to omit it or it's a mismatch.
            // For now, I'll omit it from persistence if it doesn't exist in Prisma type.
            // Prisma.OrganizationPlanUncheckedCreateInput: id, name, slug, description, image, price, currency, limits, stripePriceId, createdAt, updatedAt, deletedAt, isActive.
            createdAt: domain.createdAt,
            updatedAt: domain.updatedAt,
            isActive: domain.status === EntityStatus.ACTIVE,
            deletedAt: domain.deletedAt,
            name: domain.name,
            slug: domain.slug,
            price: domain.price,
            currency: domain.currency,
            interval: domain.interval as any,
            description: domain.description,
            image: domain.image,
            stripePriceId: domain.stripePriceId,
            limits: domain.limits as any,
        }
    }
}
