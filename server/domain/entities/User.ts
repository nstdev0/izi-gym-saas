import { BaseEntity, EntityStatus } from "./_base";

export class User extends BaseEntity {
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
    public role: string,
    public isActive: boolean,
    public image: string | null,
  ) {
    super(id, organizationId, createdAt, updatedAt, status, deletedAt);
  }
}
