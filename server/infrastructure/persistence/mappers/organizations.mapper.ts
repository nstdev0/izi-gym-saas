import { Organization } from "@/server/domain/entities/Organization";
import { EntityStatus } from "@/server/domain/entities/_base";
import { IMapperInterface } from "./IMapper.interface";
import { OrganizationPlanMapper } from "./organization-plans.mapper";

export class OrganizationMapper implements IMapperInterface<Organization> {
    toDomain(raw: any): Organization {
        let planEntity;
        if (raw.plan) {
            const planMapper = new OrganizationPlanMapper();
            planEntity = planMapper.toDomain(raw.plan);
        }

        return new Organization(
            raw.id,
            raw.organizationId,
            raw.createdAt,
            raw.updatedAt,
            raw.status ? EntityStatus.ACTIVE : EntityStatus.INACTIVE,
            raw.deletedAt,
            raw.name,
            raw.slug,
            raw.isActive,
            raw.organizationPlan, // This is the Name string
            raw.image,
            raw.config,
            raw.organizationPlanId,
            planEntity
        )
    }
}