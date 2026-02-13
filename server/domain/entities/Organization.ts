import { BaseEntity, EntityStatus } from "./_base";

interface OrganizationConfig {
  id: string
  locale: string
  timezone: string
  currency: string
  identity: Record<string, unknown>
  branding: Record<string, unknown>
  billing: Record<string, unknown>
  booking: Record<string, unknown>
  accessControl: Record<string, unknown>
  notifications: Record<string, unknown>
  features: Record<string, unknown>
  staffSettings: Record<string, unknown>
}

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
    public isActive: boolean,
    public image?: string,
    public config?: OrganizationConfig,
    public organizationPlanId?: string,
  ) {
    super(id, organizationId, createdAt, updatedAt, status, deletedAt);
  }
}
