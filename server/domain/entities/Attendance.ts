import { BaseEntity, EntityStatus } from "./_base";

export class Attendance extends BaseEntity {
    constructor(
        id: string,
        organizationId: string,
        createdAt: Date,
        updatedAt: Date,
        status: EntityStatus,
        deletedAt: Date | null,
        public memberId: string,
        public date: Date,
        public method: string,
        public member?: Record<string, unknown>
    ) {
        super(id, organizationId, createdAt, updatedAt, status, deletedAt);
    }
}