import { BaseEntity, EntityStatus } from "./_base";

export class OrganizationConfig extends BaseEntity {
    constructor(
        id: string,
        organizationId: string,
        createdAt: Date,
        updatedAt: Date,
        status: EntityStatus, // BaseEntity requires status, though config might not use it actively
        deletedAt: Date | null,

        public locale: string,
        public timezone: string,
        public currency: string,
        public identity: Record<string, unknown> | null,
        public branding: Record<string, unknown> | null,
        public billing: Record<string, unknown> | null,
        public booking: Record<string, unknown> | null,
        public accessControl: Record<string, unknown> | null,
        public notifications: Record<string, unknown> | null,
        public features: Record<string, unknown> | null,
        public staffSettings: Record<string, unknown> | null,
    ) {
        super(id, organizationId, createdAt, updatedAt, status, deletedAt);
    }
}
