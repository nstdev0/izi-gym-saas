import { Prisma } from "@/generated/prisma/client";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { EntityStatus } from "@/server/domain/entities/_base";
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
  implements IPlansRepository {

  protected async buildPrismaClauses(
    filters: PlansFilters,
  ): Promise<[Prisma.PlanWhereInput, Prisma.PlanOrderByWithRelationInput]> {
    const ALLOWED_SORT_FIELDS = ["createdAt", "name", "price", "durationDays"] as const;
    const ALLOWED_STATUS = ["active", "inactive"] as const;

    const conditions: Prisma.PlanWhereInput[] = [];

    // Search filter
    if (filters.search) {
      const searchTerms = filters.search.trim().split(/\s+/).filter(Boolean);

      if (searchTerms.length > 0) {
        searchTerms.forEach((term) => {
          conditions.push({
            OR: [
              { name: { contains: term, mode: "insensitive" } },
              { description: { contains: term, mode: "insensitive" } },
            ],
          });
        });
      }
    }

    // Status filter (isActive)
    if (filters.status) {
      const statusInput = filters.status.toLowerCase();
      const isValidStatus = (ALLOWED_STATUS as readonly string[]).includes(statusInput);

      if (isValidStatus) {
        conditions.push({ isActive: statusInput === "active" });
      }
    }

    const WhereClause: Prisma.PlanWhereInput = conditions.length > 0 ? { AND: conditions } : {};

    // Sort
    let OrderByClause: Prisma.PlanOrderByWithRelationInput = { createdAt: "desc" };

    if (filters.sort) {
      const [field, direction] = filters.sort.split("-");
      const isValidField = (ALLOWED_SORT_FIELDS as readonly string[]).includes(field);
      const isValidDirection = direction === "asc" || direction === "desc";

      if (isValidField && isValidDirection) {
        OrderByClause = { [field]: direction as Prisma.SortOrder };
      }
    }

    return [WhereClause, OrderByClause];
  }
}
