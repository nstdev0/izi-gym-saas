import { MembershipStatus } from "@/shared/types/memberships.types";

export enum EntityStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export abstract class BaseEntity<TStatus = EntityStatus | MembershipStatus> {
  constructor(
    public readonly id: string,
    public readonly organizationId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly status: TStatus,
    public readonly deletedAt?: Date | null,
  ) { }
}
