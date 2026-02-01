import {
  IPlansRepository,
  PlansFilters,
} from "@/server/application/repositories/plans.repository.interface";
import {
  PageableRequest,
  PageableResponse,
} from "@/server/shared/common/pagination";
import { Plan } from "@/server/domain/entities/Plan";

export class GetAllPlansUseCase {
  constructor(private readonly repository: IPlansRepository) {}

  async execute(
    request: PageableRequest<PlansFilters>,
  ): Promise<PageableResponse<Plan>> {
    return await this.repository.findAll(request);
  }
}
