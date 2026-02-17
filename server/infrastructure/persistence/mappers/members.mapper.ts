import { Member } from "@/server/domain/entities/Member";
import { IMapperInterface } from "./IMapper.interface";

export class MemberMapper implements IMapperInterface<Member> {
    toDomain(raw: any): Member {
        return new Member(
            raw.id,
            raw.organizationId,
            raw.createdAt,
            raw.updatedAt,
            raw.status,
            raw.deletedAt,
            raw.firstName,
            raw.lastName,
            raw.docType,
            raw.docNumber,
            raw.isActive,
            raw.qr,
            raw.email,
            raw.phone,
            raw.birthDate,
            raw.gender,
            raw.height,
            raw.weight,
            raw.imc,
            raw.image,
            raw.memberships,
            raw.oldEmail,
            raw.oldDocNumber,
        )
    }
}