import { Membership as PrismaMembership, Prisma } from "@/generated/prisma/client";
import { Membership, MembershipStatus } from "@/server/domain/entities/Membership";
import { IMapperInterface } from "./IMapper.interface";

type PrismaMembershipWithRelations = PrismaMembership & {
    member?: { firstName: string; lastName: string; image: string | null; docNumber: string; } | null;
    plan?: { name: string } | null;
};

export class MembershipMapper implements IMapperInterface<Membership, Prisma.MembershipUncheckedCreateInput> {
    toDomain(raw: any): Membership {
        const domainEntity = new Membership(
            raw.id,
            raw.organizationId,
            raw.createdAt,
            raw.updatedAt,
            raw.status as MembershipStatus,
            raw.startDate,
            raw.endDate,
            raw.pricePaid.toNumber(),
            raw.memberId,
            raw.planId,
            raw.deletedAt,
        );

        if (raw.member) {
            domainEntity.memberName = `${raw.member.firstName} ${raw.member.lastName}`;
            domainEntity.member = {
                firstName: raw.member.firstName,
                lastName: raw.member.lastName,
                image: raw.member.image ?? null, // Ensure string | null
                docNumber: raw.member.docNumber,
            };
        }

        if (raw.plan) {
            domainEntity.planName = raw.plan.name;
            domainEntity.plan = {
                name: raw.plan.name,
            };
        }

        return domainEntity;
    }

    toPersistence(domain: Membership): Prisma.MembershipUncheckedCreateInput {
        return {
            id: domain.id,
            organizationId: domain.organizationId,
            createdAt: domain.createdAt,
            updatedAt: domain.updatedAt,
            status: domain.status as MembershipStatus,
            startDate: domain.startDate,
            endDate: domain.endDate,
            pricePaid: domain.pricePaid,
            memberId: domain.memberId,
            planId: domain.planId,
            deletedAt: domain.deletedAt,
        }
    }
}