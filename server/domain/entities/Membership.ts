import { BaseEntity } from "./_base";
import { MembershipStatus } from "@/shared/types/memberships.types";

export class Membership extends BaseEntity<MembershipStatus> {
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
    public member?: { firstName: string; lastName: string; image: string | null; docNumber: string; },
    public plan?: { name: string; },
  ) {
    super(id, organizationId, createdAt, updatedAt, status, deletedAt);
  }
}
