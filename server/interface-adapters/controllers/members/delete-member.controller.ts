import { IDeleteMemberUseCase } from "@/server/application/use-cases/members/delete-member.use-case";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class DeleteMemberController implements ControllerExecutor<void, void> {
  constructor(private readonly deleteMemberUseCase: IDeleteMemberUseCase) { }

  async execute(input: void, id?: string): Promise<void> {
    if (!id) {
      throw new Error("No se proporciono un id");
    }
    await this.deleteMemberUseCase.execute(id);
  }
}
