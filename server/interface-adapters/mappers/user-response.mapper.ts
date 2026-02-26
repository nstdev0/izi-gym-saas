import { UserWithMembership } from "@/server/domain/entities/User";
import { UserResponse } from "@/shared/types/users.types";

export class UserResponseMapper {
    static toResponse(entity: UserWithMembership): UserResponse {
        return {
            id: entity.id,
            firstName: entity.firstName,
            lastName: entity.lastName,
            email: entity.email,
            isActive: entity.isActive,
            image: entity.image,
            preferences: entity.preferences,
            status: entity.status,
            createdAt: entity.createdAt.toISOString(),
            updatedAt: entity.updatedAt.toISOString(),
            deletedAt: entity.deletedAt?.toISOString() ?? null,
            membership: entity.organizationId && entity.role ? {
                organizationId: entity.organizationId,
                role: entity.role
            } : null
        };
    }

    static toResponseArray(entities: UserWithMembership[]): UserResponse[] {
        return entities.map(e => this.toResponse(e));
    }
}
