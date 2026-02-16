import { User } from "@/server/domain/entities/User";
import { IMapperInterface } from "./IMapper.interface";

export class UserMapper implements IMapperInterface<User> {
    toDomain(raw: any): User {
        return new User(
            raw.id,
            raw.organizationId,
            raw.createdAt,
            raw.updatedAt,
            raw.status,
            raw.deletedAt,
            raw.firstName,
            raw.lastName,
            raw.email,
            raw.role,
            raw.isActive,
            raw.image,
            raw.preferences,
        )
    }
}