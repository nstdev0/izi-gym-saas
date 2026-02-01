import { IGetMemberByIdUseCase } from "@/server/application/use-cases/members/get-member-by-id.use-case";
import { NotFoundError } from "@/server/domain/errors/common";

export class GetMemberByIdController {
  constructor(private readonly getMemberByIdUseCase: IGetMemberByIdUseCase) {}

  async execute(id: string) {
    const member = await this.getMemberByIdUseCase.execute(id);

    if (!member) {
      throw new NotFoundError("Miembro no encontrado");
    }

    return member;
  }
}
