import { IMapperInterface } from "./IMapper.interface";
import { Attendance } from "@/server/domain/entities/Attendance";

export class AttendanceMapper implements IMapperInterface<Attendance> {
    toDomain(raw: any): Attendance {
        return {
            id: raw.id,
            organizationId: raw.organizationId,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
            status: raw.status,
            deletedAt: raw.deletedAt ?? null,
            memberId: raw.memberId,
            date: raw.date,
            method: raw.method,
            member: {
                id: raw.member.id,
                firstName: raw.member.firstName,
                lastName: raw.member.lastName,
                image: raw.member.image,
            },
        };
    }
}
