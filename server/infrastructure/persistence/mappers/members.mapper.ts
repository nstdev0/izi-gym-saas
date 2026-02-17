import { Member } from "@/server/domain/entities/Member";
import { IMapperInterface } from "./IMapper.interface";
import { Member as PrismaMember, Prisma } from "@/generated/prisma/client";
import { EntityStatus } from "@/server/domain/entities/_base";
import { DocType, Gender } from "@/shared/types/members.types";

export class MemberMapper implements IMapperInterface<Member, Prisma.MemberUncheckedCreateInput> {
    toDomain(raw: PrismaMember): Member {
        return new Member(
            raw.id,
            raw.organizationId,
            raw.createdAt,
            raw.updatedAt,
            raw.status as EntityStatus,
            raw.deletedAt,
            raw.firstName,
            raw.lastName,
            raw.docType as DocType,
            raw.docNumber,
            raw.isActive,
            raw.qr,
            raw.email,
            raw.phone,
            raw.birthDate,
            raw.gender as Gender,
            raw.height,
            raw.weight,
            raw.imc,
            raw.image,
            undefined, // memberships not loaded by default here
        )
    }

    toPersistence(domain: Member): Prisma.MemberUncheckedCreateInput {
        return {
            id: domain.id,
            organizationId: domain.organizationId,
            createdAt: domain.createdAt,
            updatedAt: domain.updatedAt,
            status: domain.status as EntityStatus,
            deletedAt: domain.deletedAt,
            firstName: domain.firstName,
            lastName: domain.lastName,
            docType: domain.docType,
            docNumber: domain.docNumber,
            isActive: domain.isActive,
            qr: domain.qr,
            email: domain.email,
            phone: domain.phone,
            birthDate: domain.birthDate,
            gender: domain.gender,
            height: domain.height,
            weight: domain.weight,
            imc: domain.imc,
            image: domain.image,
        }
    }
}