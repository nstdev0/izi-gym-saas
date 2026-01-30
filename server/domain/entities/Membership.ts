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
    public startDate: Date,
    public endDate: Date,
    public status: MembershipStatus,
    public pricePaid: number,
    public memberId: string,
    public planId: string,
  ) {
    super(id, organizationId, createdAt, updatedAt);
  }

  isActiveNow(): boolean {
    const now = new Date();
    return (
      this.status === MembershipStatus.ACTIVE &&
      this.startDate <= now &&
      now <= this.endDate
    );
  }

  daysRemaining(): number {
    const now = new Date();
    const diff = Math.abs(this.endDate.getTime() - now.getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}
