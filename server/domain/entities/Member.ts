import { BaseEntity } from "./_base";

export class Member extends BaseEntity {
  constructor(
    id: string,
    organizationId: string,
    createdAt: Date,
    updatedAt: Date,
    public firstName: string,
    public lastName: string,
    public birthDate: Date,
    public email: string,
    public readonly docType: string,
    public readonly docNumber: string,
    public readonly phone: string,
  ) {
    super(id, organizationId, createdAt, updatedAt);
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
