import { UpdateMemberInput } from "@/server/application/dtos/members.dto";
import { IUpdateMemberUseCase } from "@/server/application/use-cases/members/update-member.use-case";
import { BadRequestError } from "@/server/domain/errors/common";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class UpdateMemberController implements ControllerExecutor<UpdateMemberInput, void> {
  constructor(private readonly useCase: IUpdateMemberUseCase) { }

  async execute(input: UpdateMemberInput, id?: string): Promise<void> {
    if (!id) {
      throw new BadRequestError("No se proporciono un id");
    }
    await this.useCase.execute(id, input);
  }
}
