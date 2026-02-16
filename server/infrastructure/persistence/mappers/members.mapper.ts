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
            raw.firstName,
            raw.lastName,
            raw.email,
            raw.phone,
            raw.address,
            raw.city,
            raw.state,
            raw.zipCode,
            raw.country,
            raw.deletedAt,
        )
    }
}