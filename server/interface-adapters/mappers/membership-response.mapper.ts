import { Membership } from "@/server/domain/entities/Membership";
import { MembershipResponse } from "@/shared/types/memberships.types";

export class MembershipResponseMapper {
    static toResponse(entity: Membership): MembershipResponse {
        return {
            id: entity.id,
            organizationId: entity.organizationId,
            status: entity.status,
            startDate: entity.startDate.toISOString(),
            endDate: entity.endDate.toISOString(),
            pricePaid: entity.pricePaid,
            memberId: entity.memberId,
            planId: entity.planId,
            memberName: entity.memberName ?? null,
            planName: entity.planName ?? null,
            member: entity.member,
            plan: entity.plan,
            createdAt: entity.createdAt.toISOString(),
            updatedAt: entity.updatedAt.toISOString(),
            deletedAt: entity.deletedAt?.toISOString() ?? null,
        };
    }

    static toResponseArray(entities: Membership[]): MembershipResponse[] {
        return entities.map(this.toResponse);
    }
}
