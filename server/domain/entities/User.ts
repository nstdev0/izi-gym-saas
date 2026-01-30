import { BaseEntity } from "./_base";

export class User extends BaseEntity {
  constructor(
    id: string,
    organizationId: string,
    createdAt: Date,
    updatedAt: Date,
    public name: string,
    public email: string,
    public passwordHash: string,
    public role: string,
  ) {
    super(id, organizationId, createdAt, updatedAt);
  }
}
