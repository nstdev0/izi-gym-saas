import { Organization } from "@/server/domain/entities/Organization";
import { EntityStatus } from "@/server/domain/entities/_base";
import { IMapperInterface } from "./IMapper.interface";
import { OrganizationPlanMapper } from "./organization-plans.mapper";
import { OrganizationConfig } from "@/server/domain/entities/OrganizationConfig";
import { Prisma, Organization as PrismaOrganization, OrganizationConfig as PrismaOrganizationConfig, OrganizationPlan } from "@/generated/prisma/client";

type PrismaOrganizationWithRelations = PrismaOrganization & {
    config?: PrismaOrganizationConfig | null;
    plan?: OrganizationPlan | null;
};

export class OrganizationMapper implements IMapperInterface<Organization, PrismaOrganization> {
    toDomain(raw: PrismaOrganizationWithRelations): Organization {
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
            raw.image || undefined,
            raw.config ? new OrganizationConfig(
                raw.config.id,
                raw.config.organizationId,
                raw.config.createdAt,
                raw.config.updatedAt,
                raw.config.deletedAt ? EntityStatus.INACTIVE : EntityStatus.ACTIVE,
                raw.config.deletedAt,
                raw.config.locale,
                raw.config.timezone,
                raw.config.currency,
                raw.config.identity as any,
                raw.config.branding as any,
                raw.config.billing as any,
                raw.config.booking as any,
                raw.config.accessControl as any,
                raw.config.notifications as any,
                raw.config.features as any,
                raw.config.staffSettings as any,
            ) : null,
            raw.organizationPlanId,
            planEntity,
            raw.storageUsed,
        )
    }

    toPersistence(domain: Organization): Prisma.OrganizationUncheckedCreateInput {
        return {
            id: domain.id,
            organizationId: domain.organizationId,
            createdAt: domain.createdAt,
            updatedAt: domain.updatedAt,
            deletedAt: domain.deletedAt,
            name: domain.name,
            slug: domain.slug,
            isActive: domain.isActive,
            organizationPlan: domain.organizationPlan,
            image: domain.image,
            config: domain.config as any,
            organizationPlanId: domain.organizationPlanId!,
            status: domain.status === EntityStatus.ACTIVE,
        }
    }
}