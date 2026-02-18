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

export interface BaseResponse {
    id: string;
    organizationId: string;
    createdAt: string;
    updatedAt: string;
    status: EntityStatus | MembershipStatus;
    deletedAt?: string | null;
}
