import { BaseEntity, EntityStatus } from "./_base";
import { OrganizationPlan } from "./OrganizationPlan";


export class Organization extends BaseEntity {
  constructor(
    id: string,
    organizationId: string,
    createdAt: Date,
    updatedAt: Date,
    status: EntityStatus,
    deletedAt: Date | null,
    public name: string,
    public slug: string,
    public settings: any,
    public plan?: OrganizationPlan,
    public image?: string,
    public membersCount: number = 0,
  ) {
    super(id, organizationId, createdAt, updatedAt, status, deletedAt);
  }
}
