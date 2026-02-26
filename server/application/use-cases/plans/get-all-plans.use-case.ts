import {
  IPlansRepository,
  PlansFilters,
} from "@/server/application/repositories/plans.repository.interface";
import {
  PageableRequest,
  PageableResponse,
} from "@/shared/types/pagination.types";
import { Plan } from "@/server/domain/entities/Plan";

import { IPermissionService } from "@/server/application/services/permission.service.interface";

export class GetAllPlansUseCase {
  constructor(
    private readonly repository: IPlansRepository,
    private readonly permissions: IPermissionService
  ) { }

  async execute(
    request: PageableRequest<PlansFilters>,
  ): Promise<PageableResponse<Plan>> {
    this.permissions.require('plans:read');
    const response = await this.repository.findAll(request);
    response.records.forEach((plan) => {
      plan.price = Number(plan.price);
    });
    return response;
  }
}
