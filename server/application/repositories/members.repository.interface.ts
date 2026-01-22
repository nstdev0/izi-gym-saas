import { Member } from "@entities/Member";
import { IBaseRepository } from "./base.repository.interface";

export interface CreateMemberInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface UpdateMemberInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface IMembersRepository extends IBaseRepository<Member> {
  findByEmail(): Promise<null>;
}
