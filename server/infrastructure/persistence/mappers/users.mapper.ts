import { User } from "@/server/domain/entities/User";
import { EntityStatus } from "@/server/domain/entities/_base";
import { IMapperInterface } from "./IMapper.interface";
import { Prisma, User as PrismaUser } from "@/generated/prisma/client";

export class UserMapper implements IMapperInterface<User, PrismaUser> {
    toDomain(raw: PrismaUser): User {
        return new User(
            raw.id,
            raw.organizationId!,
            raw.createdAt,
            raw.updatedAt,
            raw.isActive ? EntityStatus.ACTIVE : EntityStatus.INACTIVE, // Derived status
            raw.deletedAt,
            raw.firstName,
            raw.lastName,
            raw.email,
            raw.role as any,
            raw.isActive,
            raw.image,
            raw.preferences as any,
            raw.hasUsedTrial,
        )
    }

    toPersistence(domain: User): Prisma.UserUncheckedCreateInput {
        return {
            id: domain.id,
            organizationId: domain.organizationId,
            createdAt: domain.createdAt,
            updatedAt: domain.updatedAt,
            deletedAt: domain.deletedAt,
            firstName: domain.firstName,
            lastName: domain.lastName,
            email: domain.email,
            role: domain.role as any,
            isActive: domain.isActive,
            image: domain.image,
            preferences: domain.preferences as any,
            hasUsedTrial: domain.hasUsedTrial,
        }
    }
}