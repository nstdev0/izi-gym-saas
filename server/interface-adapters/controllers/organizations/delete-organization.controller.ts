import { IDeleteOrganizationUseCase } from "@/server/application/use-cases/organizations/delete-organization.use-case";
import { BadRequestError } from "@/server/domain/errors/common";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class DeleteOrganizationController implements ControllerExecutor<void, void> {
  constructor(private readonly useCase: IDeleteOrganizationUseCase) { }

  async execute(input: void, id?: string): Promise<void> {
    if (!id) {
      throw new BadRequestError("No se proporcionó un id");
    }
    await this.useCase.execute(id);
  }
}
