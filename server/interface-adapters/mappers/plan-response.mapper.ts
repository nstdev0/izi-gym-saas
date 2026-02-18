import { Plan } from "@/server/domain/entities/Plan";
import { PlanResponse } from "@/shared/types/plans.types";

export class PlanResponseMapper {
    static toResponse(entity: Plan): PlanResponse {
        return {
            id: entity.id,
            organizationId: entity.organizationId,
            name: entity.name,
            slug: entity.slug,
            description: entity.description,
            price: entity.price,
            durationDays: entity.durationDays,
            isActive: entity.isActive,
            image: entity.image ?? null,
            status: entity.status,
            createdAt: entity.createdAt.toISOString(),
            updatedAt: entity.updatedAt.toISOString(),
            deletedAt: entity.deletedAt?.toISOString() ?? null,
        };
    }

    static toResponseArray(entities: Plan[]): PlanResponse[] {
        return entities.map(this.toResponse);
    }
}
