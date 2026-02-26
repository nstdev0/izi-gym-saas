import { BaseEntity, EntityStatus } from "./_base";

import { OrganizationConfig } from "./OrganizationConfig";
import { OrganizationPlan } from "./OrganizationPlan";

export class Organization extends BaseEntity<EntityStatus> {
  constructor(
    id: string,
    organizationId: string,
    createdAt: Date,
    updatedAt: Date,
    status: EntityStatus,
    deletedAt: Date | null,
    public name: string,
    public slug: string,
    public isActive: boolean,
    public organizationPlan: string,
    public image?: string,
    public config?: OrganizationConfig | null,
    public organizationPlanId?: string,
    public plan?: OrganizationPlan,
    public storageUsed?: bigint,
    public stripeCustomerId?: string,
    public stripeSubscriptionId?: string,
    public hasUsedTrial: boolean = false,
  ) {
    super(id, organizationId, createdAt, updatedAt, status, deletedAt);
  }

  canConsumeTrial(): boolean {
    return this.hasUsedTrial === false;
  }
}
