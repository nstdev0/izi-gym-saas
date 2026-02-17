import { MembershipStatus } from "./memberships.types";

export enum EntityStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
}

export interface BaseEntity {
    id: string;
    organizationId: string;
    createdAt: Date;
    updatedAt: Date;
    status: EntityStatus | MembershipStatus;
    deletedAt?: Date | null;
}
