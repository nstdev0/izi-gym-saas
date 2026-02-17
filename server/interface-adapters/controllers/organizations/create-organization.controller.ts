import { ICreateOrganizationUseCase } from "@/server/application/use-cases/organizations/create-organization.use-case";
import { BadRequestError } from "@/server/domain/errors/common";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { CreateOrganizationInput } from "@/shared/types/organizations.types";

export class CreateOrganizationController implements ControllerExecutor<CreateOrganizationInput, void> {
  constructor(private readonly useCase: ICreateOrganizationUseCase) { }

  async execute(input: CreateOrganizationInput): Promise<void> {
    const { userId, ...data } = input;
    if (!userId) {
      throw new BadRequestError("User ID is required");
    }
    await this.useCase.execute(data, userId);
  }
}

export type ICreateOrganizationController = InstanceType<typeof CreateOrganizationController>;
