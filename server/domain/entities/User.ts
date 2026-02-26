import { BaseEntity, EntityStatus } from "./_base";
import { Role } from "@/shared/types/users.types";

export class User extends BaseEntity<EntityStatus> {
  constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    status: EntityStatus,
    deletedAt: Date | null,
    public firstName: string | null,
    public lastName: string | null,
    public email: string,
    public isActive: boolean,
    public image: string | null,
    public preferences: Record<string, unknown> | null = null,
  ) {
    // User global no tiene organizationId base
    super(id, "", createdAt, updatedAt, status, deletedAt);
  }
}

// Representa a un usuario en el contexto de una organización específica
export class UserWithMembership extends User {
  constructor(
    user: User,
    public organizationId: string,
    public role: Role
  ) {
    super(
      user.id,
      user.createdAt,
      user.updatedAt,
      user.status,
      user.deletedAt || null,
      user.firstName,
      user.lastName,
      user.email,
      user.isActive,
      user.image,
      user.preferences,
    );
  }
}
