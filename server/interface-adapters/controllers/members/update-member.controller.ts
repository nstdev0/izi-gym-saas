import { UpdateMemberInput } from "@/server/application/dtos/members.dto";
import { IUpdateMemberUseCase } from "@/server/application/use-cases/members/update-member.use-case";
import { Member } from "@/server/domain/entities/Member";
import { BadRequestError } from "@/server/domain/errors/common";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class UpdateMemberController implements ControllerExecutor<UpdateMemberInput, Member | null> {
  constructor(private readonly useCase: IUpdateMemberUseCase) { }

  async execute(input: UpdateMemberInput, id?: string) {
    if (!id) {
      throw new BadRequestError("No se proporciono un id");
    }
    return await this.useCase.execute(id, input);
  }
}
