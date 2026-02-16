import { Plan } from "@/server/domain/entities/Plan";
import { IMapperInterface } from "./IMapper.interface";

export class PlanMapper implements IMapperInterface<Plan> {
    toDomain(raw: any): Plan {
        return new Plan(
            raw.id,
            raw.organizationId,
            raw.createdAt,
            raw.updatedAt,
            raw.status,
            raw.deletedAt,
            raw.name,
            raw.description,
            raw.price.toNumber(),
            raw.durationDays,
            raw.isActive,
            raw.image,
        )
    }
}