import { UpdateMembershipInput } from "@/server/application/dtos/memberships.dto";
import { UpdateMembershipUseCase } from "@/server/application/use-cases/memberships/update-membership.use-case";
import { BadRequestError } from "@/server/domain/errors/common";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class UpdateMembershipController implements ControllerExecutor<UpdateMembershipInput, void> {
  constructor(private readonly useCase: UpdateMembershipUseCase) { }

  async execute(input: UpdateMembershipInput, id?: string): Promise<void> {
    if (!id) {
      throw new BadRequestError("No se proporcionó un id");
    }
    await this.useCase.execute(id, input);
  }
}
