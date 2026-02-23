import { Member } from "@/server/domain/entities/Member";
import { MemberResponse } from "@/shared/types/members.types";

export class MemberResponseMapper {
    static toResponse(entity: Member): MemberResponse {
        return {
            id: entity.id,
            organizationId: entity.organizationId,
            firstName: entity.firstName,
            lastName: entity.lastName,
            fullName: entity.fullName,
            docType: entity.docType,
            docNumber: entity.docNumber,
            email: entity.email ?? null,
            phone: entity.phone ?? null,
            birthDate: entity.birthDate?.toISOString() ?? null,
            gender: entity.gender ?? null,
            height: entity.height ?? null,
            weight: entity.weight ?? null,
            imc: entity.imc ?? null,
            image: entity.image ?? null,
            isActive: entity.isActive,
            qr: entity.qr,
            status: entity.status,
            createdAt: entity.createdAt.toISOString(),
            updatedAt: entity.updatedAt.toISOString(),
            deletedAt: entity.deletedAt?.toISOString() ?? null,
            memberships: entity.memberships?.map(m => ({
                status: m.status,
                plan: m.plan ? { name: m.plan!.name } : undefined
            })),
        };
    }

    static toResponseArray(entities: Member[]): MemberResponse[] {
        return entities.map(this.toResponse);
    }
}
