import { User } from "@/server/domain/entities/User";
import { UserResponse } from "@/shared/types/users.types";

export class UserResponseMapper {
    static toResponse(entity: User): UserResponse {
        return {
            id: entity.id,
            organizationId: entity.organizationId,
            firstName: entity.firstName,
            lastName: entity.lastName,
            email: entity.email,
            role: entity.role,
            isActive: entity.isActive,
            image: entity.image,
            preferences: entity.preferences,
            status: entity.status,
            createdAt: entity.createdAt.toISOString(),
            updatedAt: entity.updatedAt.toISOString(),
            deletedAt: entity.deletedAt?.toISOString() ?? null,
        };
    }

    static toResponseArray(entities: User[]): UserResponse[] {
        return entities.map(this.toResponse);
    }
}
