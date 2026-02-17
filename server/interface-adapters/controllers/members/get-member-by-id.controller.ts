import { IGetMemberByIdUseCase } from "@/server/application/use-cases/members/get-member-by-id.use-case";
import { BadRequestError, NotFoundError } from "@/server/domain/errors/common";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { Member } from "@/shared/types/members.types";

export class GetMemberByIdController implements ControllerExecutor<void, Member | null> {
  constructor(private readonly useCase: IGetMemberByIdUseCase) { }

  async execute(_input: void, id?: string) {
    if (!id) {
      throw new BadRequestError("No se proporciono un id");
    }
    const member = await this.useCase.execute(id);

    if (!member) {
      throw new NotFoundError("Miembro no encontrado");
    }
    return member;
  }
}
