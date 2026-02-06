import { DocType, Member } from "@entities/Member";
import { IBaseRepository } from "./base.repository.interface";
import {
  CreateMemberInput,
  UpdateMemberInput,
} from "@/server/domain/types/members";

export interface MembersFilters {
  search?: string;
  sort?: string;
  status?: string
  membershipStatus?: string
}

export interface IMembersRepository extends IBaseRepository<
  Member,
  CreateMemberInput,
  UpdateMemberInput,
  MembersFilters
> {
  validateUnique(args: Partial<Member>): Promise<Member | null>;
  findByIdWithMemberships(id: string): Promise<Member | null>;
}
