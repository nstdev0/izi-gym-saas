import { BaseEntity, EntityStatus } from "./_base";
import { Role } from "@/shared/types/users.types";

export class User extends BaseEntity<EntityStatus> {
  constructor(
    id: string,
    organizationId: string,
    createdAt: Date,
    updatedAt: Date,
    status: EntityStatus,
    deletedAt: Date | null,
    public firstName: string | null,
    public lastName: string | null,
    public email: string,
    public role: Role,
    public isActive: boolean,
    public image: string | null,
    public preferences: Record<string, unknown> | null = null,
  ) {
    super(id, organizationId, createdAt, updatedAt, status, deletedAt);
  }
}
