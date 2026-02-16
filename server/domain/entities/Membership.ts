import { BaseEntity } from "./_base";

export enum MembershipStatus {
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  PENDING = "PENDING",
  CANCELLED = "CANCELLED",
}

export class Membership extends BaseEntity {
  constructor(
    id: string,
    organizationId: string,
    createdAt: Date,
    updatedAt: Date,
    status: MembershipStatus,
    public startDate: Date,
    public endDate: Date,
    public pricePaid: number,
    public memberId: string,
    public planId: string,
    public deletedAt?: Date | null,
    public memberName?: string,
    public planName?: string,
  ) {
    super(id, organizationId, createdAt, updatedAt, status, deletedAt);
  }
}
