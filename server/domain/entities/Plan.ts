import { BaseEntity, EntityStatus } from "./_base";

export class Plan extends BaseEntity {
  constructor(
    id: string,
    organizationId: string,
    createdAt: Date,
    updatedAt: Date,
    status: EntityStatus,
    deletedAt: Date | null,
    public name: string,
    public slug: string,
    public description: string | null,
    public price: number,
    public durationDays: number,
    public isActive: boolean,
    public image?: string | null,
  ) {
    super(id, organizationId, createdAt, updatedAt, status, deletedAt);
  }
}
