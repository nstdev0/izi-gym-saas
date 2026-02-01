import { IDeleteMemberUseCase } from "@/server/application/use-cases/members/delete-member.use-case";

export class DeleteMemberController {
  constructor(private readonly deleteMemberUseCase: IDeleteMemberUseCase) {}

  async execute(id: string) {
    return this.deleteMemberUseCase.execute(id);
  }
}
