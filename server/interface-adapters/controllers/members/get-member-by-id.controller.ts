import { IGetMemberByIdUseCase } from "@/server/application/use-cases/members/get-member-by-id.use-case";
import { Member } from "@/server/domain/entities/Member";
import { NotFoundError } from "@/server/domain/errors/common";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class GetMemberByIdController implements ControllerExecutor<void, Member | null> {
  constructor(private readonly useCase: IGetMemberByIdUseCase) { }

  async execute(input: void, id?: string) {
    if (!id) {
      throw new Error("No se proporciono un id");
    }
    const member = await this.useCase.execute(id);

    if (!member) {
      throw new NotFoundError("Miembro no encontrado");
    }

    return member;
  }
}
