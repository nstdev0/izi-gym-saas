import { ControllerExecutor } from "@/server/lib/api-handler";
import { GetHistoricStartDateUseCase } from "@use-cases/dashboard/get-historic-start-date.use-case";

export class GetHistoricStartDateController implements ControllerExecutor<Date | null> {
    constructor(private useCase: GetHistoricStartDateUseCase) { }

    async execute(): Promise<Date | null> {
        return this.useCase.execute();
    }
}