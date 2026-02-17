import { Membership } from "@/server/domain/entities/Membership";
import { IBaseRepository } from "./base.repository.interface";
import {
  CreateMembershipInput,
  UpdateMembershipInput,
  MembershipsFilters,
} from "@/server/domain/types/memberships";

export type {
  CreateMembershipInput,
  UpdateMembershipInput,
  MembershipsFilters,
};

export interface IMembershipsRepository extends IBaseRepository<
  Membership,
  CreateMembershipInput,
  UpdateMembershipInput,
  MembershipsFilters
> {
  findActiveMembershipByMemberId(memberId: string): Promise<Membership | null>;
  cancel(id: string): Promise<void>;
}
