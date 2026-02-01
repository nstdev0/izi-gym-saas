import { UpdateOrganizationSchema } from "@/server/application/dtos/organizations.dto";
import { UpdateOrganizationUseCase } from "@/server/application/use-cases/organizations/update-organization.use-case";

export class UpdateOrganizationController {
  constructor(private readonly useCase: UpdateOrganizationUseCase) {}

  async execute({ id, data }: { id: string; data: unknown }) {
    const validatedData = UpdateOrganizationSchema.parse(data);
    const organization = await this.useCase.execute(id, validatedData);
    return organization;
  }
}
