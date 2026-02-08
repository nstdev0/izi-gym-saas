import { ISystemRepository } from "../../repositories/system.repository.interface";

export class SystemGetPlansUseCase {
    constructor(private systemRepository: ISystemRepository) { }

    async execute(): Promise<any[]> {
        return this.systemRepository.getPlans();
    }
}
