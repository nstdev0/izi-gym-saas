import { BaseEntity } from "./_base";

export class Organization extends BaseEntity {
  constructor(
    id: string,
    organizationId: string,
    createdAt: Date,
    updatedAt: Date,
    public name: string,
    public slug: string,
    public isActive: boolean,
  ) {
    super(id, organizationId, createdAt, updatedAt);
  }
}
