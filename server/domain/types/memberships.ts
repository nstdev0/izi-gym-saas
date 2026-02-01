import { MembershipStatus } from "@/generated/prisma/client";

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
  status?: MembershipStatus;
  memberId?: string;
  planId?: string;
}
