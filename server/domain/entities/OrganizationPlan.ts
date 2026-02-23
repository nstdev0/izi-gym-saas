import { BaseEntity, EntityStatus } from "./_base";

export class OrganizationPlan extends BaseEntity {
    constructor(
        id: string,
        organizationId: string, // actually this might be system level, so maybe empty or null? In prisma it's global.
        createdAt: Date,
        updatedAt: Date,
        status: EntityStatus,
        deletedAt: Date | null,
        public name: string,
        public slug: string,
        public price: number,
        public currency: string,
        public interval: string,
        public description: string | null,
        public image: string | null,
        public stripePriceId: string | null,
        public limits: any,
    ) {
        super(id, organizationId, createdAt, updatedAt, status, deletedAt);
    }

    get isActive(): boolean {
        return this.status === EntityStatus.ACTIVE;
    }
}
