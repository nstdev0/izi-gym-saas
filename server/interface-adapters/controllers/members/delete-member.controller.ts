import { IDeleteMemberUseCase } from "@/server/application/use-cases/members/delete-member.use-case";
import { Member } from "@/server/domain/entities/Member";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class DeleteMemberController implements ControllerExecutor<void, Member | null> {
  constructor(private readonly deleteMemberUseCase: IDeleteMemberUseCase) { }

  async execute(input: void, id?: string) {
    if (!id) {
      throw new Error("No se proporciono un id");
    }
    return this.deleteMemberUseCase.execute(id);
  }
}
