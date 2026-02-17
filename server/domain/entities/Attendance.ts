import { BaseEntity, EntityStatus } from "./_base";
import { Member } from "./Member";

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
        public member?: Member
    ) {
        super(id, organizationId, createdAt, updatedAt, status, deletedAt);
    }
}