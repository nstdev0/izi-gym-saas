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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IMembershipsRepository extends IBaseRepository<
  Membership,
  CreateMembershipInput,
  UpdateMembershipInput,
  MembershipsFilters
> {}
