import { IMembersRepository } from "@/server/application/repositories/members.repository.interface";

export class GetMemberByQrCodeUseCase {
    constructor(private readonly repo: IMembersRepository) { }

    async execute(qrCode: string) {
        return this.repo.findByQrCode(qrCode);
    }
}

export type IGetMemberByQrCodeUseCase = InstanceType<typeof GetMemberByQrCodeUseCase>;