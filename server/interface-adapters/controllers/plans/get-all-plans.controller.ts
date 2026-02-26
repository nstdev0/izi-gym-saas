import { PlansFilters } from "@/server/application/repositories/plans.repository.interface";
import { GetAllPlansUseCase } from "@/server/application/use-cases/plans/get-all-plans.use-case";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { PageableRequest, PageableResponse } from "@/shared/types/pagination.types";
import { PlanResponse } from "@/shared/types/plans.types";
import { PlanResponseMapper } from "../../mappers/plan-response.mapper";

export class GetAllPlansController implements ControllerExecutor<PageableRequest<PlansFilters>, PageableResponse<PlanResponse>> {
  constructor(private readonly useCase: GetAllPlansUseCase) { }

  async execute(request: PageableRequest<PlansFilters>): Promise<PageableResponse<PlanResponse>> {
    const result = await this.useCase.execute(request);
    return {
      ...result,
      records: PlanResponseMapper.toResponseArray(result.records),
    };
  }
}

export type IGetAllPlansUseCase = InstanceType<typeof GetAllPlansUseCase>;
