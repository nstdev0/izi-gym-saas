import { DeleteOrganizationUseCase } from "@/server/application/use-cases/organizations/delete-organization.use-case";

export class DeleteOrganizationController {
  constructor(private readonly useCase: DeleteOrganizationUseCase) {}

  async execute(id: string) {
    const organization = await this.useCase.execute(id);
    return organization;
  }
}
