import { GetOrganizationByIdUseCase } from "@/server/application/use-cases/organizations/get-organization-by-id.use-case";

export class GetOrganizationByIdController {
  constructor(private readonly useCase: GetOrganizationByIdUseCase) {}

  async execute(id: string) {
    const organization = await this.useCase.execute(id);
    return organization;
  }
}
