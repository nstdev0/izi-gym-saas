import { IMembersRepository } from "@/server/application/repositories/members.repository.interface";

import { IPermissionService } from "@/server/application/services/permission.service.interface";

export class GetMemberByQrCodeUseCase {
    constructor(
        private readonly repo: IMembersRepository,
        private readonly permissions: IPermissionService
    ) { }

    async execute(qrCode: string) {
        this.permissions.require('members:read');
        return this.repo.findByQrCode(qrCode);
    }
}

export type IGetMemberByQrCodeUseCase = InstanceType<typeof GetMemberByQrCodeUseCase>;