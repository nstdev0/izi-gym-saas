import { IMapperInterface } from "./IMapper.interface";
import { Attendance } from "@/server/domain/entities/Attendance";
import { EntityStatus } from "@/server/domain/entities/_base";
import { Prisma } from "@/generated/prisma/client";

export class AttendanceMapper implements IMapperInterface<Attendance, Prisma.AttendanceUncheckedCreateInput> {
    toDomain(raw: any): Attendance {
        return {
            id: raw.id,
            organizationId: raw.organizationId,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
            status: raw.isActive ? EntityStatus.ACTIVE : EntityStatus.INACTIVE,
            deletedAt: raw.deletedAt ?? null,
            memberId: raw.memberId,
            date: raw.date,
            method: raw.method,
            member: raw.member ? {
                id: raw.member.id,
                firstName: raw.member.firstName,
                lastName: raw.member.lastName,
                image: raw.member.image,
            } as any : undefined,
        };
    }

    toPersistence(domain: Attendance): Prisma.AttendanceUncheckedCreateInput {
        return {
            id: domain.id,
            organizationId: domain.organizationId,
            createdAt: domain.createdAt,
            updatedAt: domain.updatedAt,
            isActive: domain.status === EntityStatus.ACTIVE,
            deletedAt: domain.deletedAt,
            memberId: domain.memberId,
            date: domain.date,
            method: domain.method as any,
        }
    }
}
