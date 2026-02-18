import { Member } from "@entities/Member";
import { IBaseRepository } from "./base.repository.interface";
import {
  CreateMemberInput,
  UpdateMemberInput,
} from "@/server/domain/types/members";

export interface MembersFilters {
  search?: string;
  sort?: string;
  status?: string
}

export interface IMembersRepository extends IBaseRepository<
  Member,
  CreateMemberInput,
  UpdateMemberInput,
  MembersFilters
> {
  validateUniqueDocument(docType: string, docNumber: string): Promise<Member | null>;
  validateUniqueEmail(email: string | null | undefined): Promise<Member | null>;
  restore(id: string): Promise<void>;
  delete(id: string): Promise<void>;
  findByIdWithMemberships(id: string): Promise<Member | null>;
  findByQrCode(qrCode: string): Promise<Member | null>;
  countActive(organizationId: string): Promise<number>;
}
