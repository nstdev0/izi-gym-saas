import { BaseEntity, EntityStatus } from "./_base";
import { Membership } from "./Membership";

import { Gender, DocType } from "@/shared/types/members.types";

export class Member extends BaseEntity<EntityStatus> {
  constructor(
    id: string,
    organizationId: string,
    createdAt: Date,
    updatedAt: Date,
    status: EntityStatus,
    deletedAt: Date | null,
    public firstName: string,
    public lastName: string,
    public docType: DocType,
    public docNumber: string,
    public isActive: boolean,
    public qr: string,
    public email?: string | null,
    public phone?: string | null,
    public birthDate?: Date | null,
    public gender?: Gender | null,
    public height?: number | null,
    public weight?: number | null,
    public imc?: number | null,
    public image?: string | null,
    public memberships?: Membership[],
  ) {
    super(id, organizationId, createdAt, updatedAt, status, deletedAt);
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
