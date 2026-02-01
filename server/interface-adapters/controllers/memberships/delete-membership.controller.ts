import { DeleteMembershipUseCase } from "@/server/application/use-cases/memberships/delete-membership.use-case";

export class DeleteMembershipController {
  constructor(private readonly useCase: DeleteMembershipUseCase) {}

  async execute(id: string) {
    const membership = await this.useCase.execute(id);
    return membership;
  }
}
