import { Prisma } from "@/generated/prisma/client";
import { BaseRepository } from "./base.repository";
import { Plan } from "@/server/domain/entities/Plan";
import { IPlansRepository } from "@/server/application/repositories/plans.repository.interface";
import {
  CreatePlanInput,
  PlansFilters,
  UpdatePlanInput,
} from "@/server/domain/types/plans";

export class PlansRepository
  extends BaseRepository<
    Prisma.PlanDelegate,
    Plan,
    CreatePlanInput,
    UpdatePlanInput,
    PlansFilters
  >
  implements IPlansRepository
{
  async buildQueryFilters(
    filters: PlansFilters,
  ): Promise<Prisma.PlanWhereInput> {
    const whereClause: Prisma.PlanWhereInput = {};

    if (filters.search) {
      whereClause.name = { contains: filters.search, mode: "insensitive" };
    }

    return whereClause;
  }
}
