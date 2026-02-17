import { PlansFilters } from "@/server/application/repositories/plans.repository.interface";
import { GetAllPlansUseCase } from "@/server/application/use-cases/plans/get-all-plans.use-case";
import { Plan } from "@/server/domain/entities/Plan";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { PageableRequest, PageableResponse } from "@/shared/common/pagination";

export class GetAllPlansController implements ControllerExecutor<PageableRequest<PlansFilters>, PageableResponse<Plan>> {
  constructor(private readonly useCase: GetAllPlansUseCase) { }

  async execute(request: PageableRequest<PlansFilters>): Promise<PageableResponse<Plan>> {
    return await this.useCase.execute(request);
  }
}

export type IGetAllPlansUseCase = InstanceType<typeof GetAllPlansUseCase>;
