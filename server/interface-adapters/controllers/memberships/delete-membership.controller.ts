import { DeleteMembershipUseCase } from "@/server/application/use-cases/memberships/delete-membership.use-case";
import { BadRequestError } from "@/server/domain/errors/common";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class DeleteMembershipController implements ControllerExecutor<void, void> {
  constructor(private readonly useCase: DeleteMembershipUseCase) { }

  async execute(_input: void, id?: string): Promise<void> {
    if (!id) {
      throw new BadRequestError("No se proporcionó un id");
    }
    await this.useCase.execute(id);
  }
}
