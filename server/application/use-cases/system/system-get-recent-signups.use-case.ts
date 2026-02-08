import { Organization } from "@/server/domain/entities/Organization";
import { ISystemRepository } from "../../repositories/system.repository.interface";

export class SystemGetRecentSignupsUseCase {
    constructor(private systemRepository: ISystemRepository) { }

    async execute(): Promise<Organization[]> {
        return this.systemRepository.getRecentSignups();
    }
}
