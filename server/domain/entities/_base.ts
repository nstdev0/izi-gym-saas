import { MembershipStatus } from "./Membership";

export enum EntityStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export abstract class BaseEntity {
  constructor(
    public readonly id: string,
    public readonly organizationId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly status: EntityStatus | MembershipStatus,
    public readonly deletedAt?: Date | null,
  ) { }
}
