import { Member } from "@entities/Member";
import { IBaseRepository } from "./base.repository.interface";
import {
  CreateMemberInput,
  UpdateMemberInput,
} from "../dtos/create-member.dto";

export interface MembersFilters {
  search?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IMembersRepository extends IBaseRepository<
  Member,
  CreateMemberInput,
  UpdateMemberInput,
  MembersFilters
> {}
