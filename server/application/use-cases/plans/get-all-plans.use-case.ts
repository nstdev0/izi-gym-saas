import {
  IPlansRepository,
  PlansFilters,
} from "@/server/application/repositories/plans.repository.interface";
import {
  PageableRequest,
  PageableResponse,
} from "@/shared/common/pagination";
import { Plan } from "@/server/domain/entities/Plan";

export class GetAllPlansUseCase {
  constructor(private readonly repository: IPlansRepository) { }

  async execute(
    request: PageableRequest<PlansFilters>,
  ): Promise<PageableResponse<Plan>> {
    const response = await this.repository.findAll(request);
    response.records.forEach((plan) => {
      plan.price = Number(plan.price);
    });
    return response;
  }
}
