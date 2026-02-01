import { GetMembershipByIdUseCase } from "@/server/application/use-cases/memberships/get-membership-by-id.use-case";

export class GetMembershipByIdController {
  constructor(private readonly useCase: GetMembershipByIdUseCase) {}

  async execute(id: string) {
    const membership = await this.useCase.execute(id);
    return membership;
  }
}
