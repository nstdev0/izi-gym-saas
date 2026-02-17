import { UpdateOrganizationInput } from "@/server/domain/types/organizations";
import { IUpdateOrganizationUseCase } from "@/server/application/use-cases/organizations/update-organization.use-case";
import { Organization } from "@/server/domain/entities/Organization";
import { BadRequestError } from "@/server/domain/errors/common";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class UpdateOrganizationController implements ControllerExecutor<UpdateOrganizationInput, void> {
  constructor(private readonly useCase: IUpdateOrganizationUseCase) { }

  async execute(input: UpdateOrganizationInput, id?: string) {
    if (!id) {
      throw new BadRequestError("No se proporcionó un id");
    }
    await this.useCase.execute(id, input);
  }
}
