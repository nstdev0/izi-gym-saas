import { MembersRepository } from "@/server/infrastructure/persistence/repositories/members.repository";

export class GetMemberByQrCodeUseCase {
    constructor(private readonly repo: MembersRepository) { }

    async execute(qrCode: string) {
        return this.repo.findByQrCode(qrCode);
    }
}

export type IGetMemberByQrCodeUseCase = InstanceType<typeof GetMemberByQrCodeUseCase>;