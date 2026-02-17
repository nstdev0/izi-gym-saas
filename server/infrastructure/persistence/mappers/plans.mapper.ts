import { Plan } from "@/server/domain/entities/Plan";
import { IMapperInterface } from "./IMapper.interface";
import { Prisma } from "@/generated/prisma/client";

export class PlanMapper implements IMapperInterface<Plan, Prisma.PlanUncheckedCreateInput> {
    toDomain(raw: any): Plan {
        return new Plan(
            raw.id,
            raw.organizationId,
            raw.createdAt,
            raw.updatedAt,
            raw.status,
            raw.deletedAt,
            raw.name,
            raw.slug,
            raw.description,
            raw.price.toNumber(),
            raw.durationDays,
            raw.isActive,
            raw.image,
        )
    }

    toPersistence(domain: Plan): Prisma.PlanUncheckedCreateInput {
        return {
            id: domain.id,
            organizationId: domain.organizationId,
            createdAt: domain.createdAt,
            updatedAt: domain.updatedAt,
            status: domain.status as any,
            deletedAt: domain.deletedAt,
            name: domain.name,
            slug: domain.slug,
            description: domain.description,
            price: domain.price,
            durationDays: domain.durationDays,
            isActive: domain.isActive,
            image: domain.image,
        }
    }
}