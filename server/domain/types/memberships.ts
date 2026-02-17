import { MembershipStatus } from "@/shared/types/memberships.types";

export interface CreateMembershipInput {
  startDate: Date;
  endDate: Date;
  status?: MembershipStatus;
  pricePaid: number;
  memberId: string;
  planId: string;
}

export type UpdateMembershipInput = Partial<CreateMembershipInput>;

export interface MembershipsFilters {
  status?: string;
  memberId?: string;
  planId?: string;
  search?: string;
  sort?: string;
}
