import { IGetOrganizationByIdUseCase } from "@/server/application/use-cases/organizations/get-organization-by-id.use-case";
import { BadRequestError } from "@/server/domain/errors/common";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { Organization } from "@/shared/types/organizations.types";

export class GetOrganizationByIdController implements ControllerExecutor<void, Organization | null> {
  constructor(private readonly useCase: IGetOrganizationByIdUseCase) { }

  async execute(input: void, id?: string): Promise<Organization | null> {
    if (!id) {
      throw new BadRequestError("No se proporcionó un id");
    }
    return await this.useCase.execute(id);
  }
}
