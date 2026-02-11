import { IDashboardRepository } from "../../repositories/dashboard.repository.interface";

export class GetHistoricStartDateUseCase {
    constructor(private repo: IDashboardRepository) { }

    async execute(): Promise<Date | null> {
        return this.repo.getHistoricStartDate()
    }
}