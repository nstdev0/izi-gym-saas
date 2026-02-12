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
        public price: number, // Decimal in prisma, number in domain
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public limits: any,
    ) {
        super(id, organizationId, createdAt, updatedAt, status, deletedAt);
    }
}
