import { IDashboardRepository } from "../../repositories/dashboard.repository.interface";
import { IPermissionService } from "@/server/application/services/permission.service.interface";

export class GetHistoricStartDateUseCase {
    constructor(
        private repo: IDashboardRepository,
        private readonly permissions: IPermissionService
    ) { }

    async execute(): Promise<Date | null> {
        this.permissions.require('dashboard:read');
        return this.repo.getHistoricStartDate()
    }
}