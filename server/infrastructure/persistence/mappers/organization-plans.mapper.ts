import { OrganizationPlan } from "@/server/domain/entities/OrganizationPlan";
import { IMapperInterface } from "./IMapper.interface";
import { EntityStatus } from "@/server/domain/entities/_base";

export class OrganizationPlanMapper implements IMapperInterface<OrganizationPlan> {
    toDomain(raw: any): OrganizationPlan {
        return new OrganizationPlan(
            raw.id,
            raw.organizationId || "",
            raw.createdAt,
            raw.updatedAt,
            raw.isActive ? EntityStatus.ACTIVE : EntityStatus.INACTIVE,
            raw.deletedAt,
            raw.name,
            raw.slug,
            Number(raw.price),
            raw.limits
        );
    }
}
