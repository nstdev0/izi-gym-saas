import { IRestoreMemberUseCase } from "@/server/application/use-cases/members/restore-member.use-case";
import { Member } from "@/server/domain/entities/Member";
import { BadRequestError, NotFoundError } from "@/server/domain/errors/common";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class RestoreMemberController implements ControllerExecutor<void, Member> {
    constructor(private readonly useCase: IRestoreMemberUseCase) { }

    async execute(_input: void, id?: string) {
        if (!id) {
            throw new BadRequestError("No se proporciono un id");
        }

        const member = await this.useCase.execute(id);

        if (!member) {
            throw new NotFoundError("Miembro no encontrado o no se pudo restaurar");
        }

        return member;
    }
}
