import { BaseEntity } from "./_base";
import { OrganizationPlan } from "./OrganizationPlan";


export class Organization extends BaseEntity {
  constructor(
    id: string,
    organizationId: string,
    createdAt: Date,
    updatedAt: Date,
    public name: string,
    public slug: string,
    public isActive: boolean,
    public settings: any,
    public plan?: OrganizationPlan,
    public image?: string,
    public membersCount: number = 0,
  ) {
    super(id, organizationId, createdAt, updatedAt);
  }
}
