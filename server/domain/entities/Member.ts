export class Member {
  constructor(
    public readonly id: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly phone: string,
    public readonly docNumber: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
