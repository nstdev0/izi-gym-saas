import { BaseEntity } from "./_base";

export class Plan extends BaseEntity {
  constructor(
    id: string,
    organizationId: string,
    createdAt: Date,
    updatedAt: Date,
    public name: string,
    public description: string | null,
    public price: number,
    public durationDays: number,
    public isActive: boolean,
  ) {
    super(id, organizationId, createdAt, updatedAt);
  }
}
