import { createOrganizationSchema } from "@/server/application/dtos/organizations.dto";
import { ICreateOrganizationUseCase } from "@/server/application/use-cases/organizations/create-organization.use-case";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { Organization } from "@/server/domain/entities/Organization";

// Input que incluye el userId agregado en la ruta
type CreateOrganizationInput = typeof createOrganizationSchema._type & { userId: string };

export class CreateOrganizationController implements ControllerExecutor<CreateOrganizationInput, void> {
  constructor(private readonly useCase: ICreateOrganizationUseCase) { }

  async execute(input: CreateOrganizationInput): Promise<void> {
    const { userId, ...data } = input;
    await this.useCase.execute(data, userId);
  }
}

export type ICreateOrganizationController = InstanceType<typeof CreateOrganizationController>;
