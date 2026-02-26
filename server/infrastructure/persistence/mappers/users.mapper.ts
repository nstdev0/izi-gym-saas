import { User } from "@/server/domain/entities/User";
import { EntityStatus } from "@/server/domain/entities/_base";
import { IMapperInterface } from "./IMapper.interface";
import { Prisma, User as PrismaUser } from "@/generated/prisma/client";

export class UserMapper {
    // Omitimos IMapperInterface porque User ahora se mapea diferente dependiendo del contexto
    toDomain(raw: PrismaUser): User {
        return new User(
            raw.id,
            raw.createdAt,
            raw.updatedAt,
            raw.isActive ? EntityStatus.ACTIVE : EntityStatus.INACTIVE, // Derived status
            raw.deletedAt,
            raw.firstName,
            raw.lastName,
            raw.email,
            raw.isActive,
            raw.image,
            raw.preferences as any,
        )
    }

    toPersistence(domain: User): Prisma.UserUncheckedCreateInput {
        return {
            id: domain.id,
            createdAt: domain.createdAt,
            updatedAt: domain.updatedAt,
            deletedAt: domain.deletedAt,
            firstName: domain.firstName,
            lastName: domain.lastName,
            email: domain.email,
            isActive: domain.isActive,
            image: domain.image,
            preferences: domain.preferences as any,
        }
    }
}