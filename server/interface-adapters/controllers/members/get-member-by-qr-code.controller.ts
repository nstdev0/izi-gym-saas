import { IGetMemberByQrCodeUseCase } from "@/server/application/use-cases/members/get-member-by-qr.use-case";
import { NotFoundError } from "@/server/domain/errors/common";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class GetMemberByQrCodeController implements ControllerExecutor {
    constructor(private readonly useCase: IGetMemberByQrCodeUseCase) { }

    async execute(_input: void, id?: string) {
        if (!id) throw new Error("Qr code is required");
        const member = await this.useCase.execute(id);

        if (!member) {
            throw new NotFoundError("Miembro no encontrado");
        }
        return member;
    }
}