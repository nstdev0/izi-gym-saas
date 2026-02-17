import { Plan } from "@/server/domain/entities/Plan";
import { IBaseRepository } from "./base.repository.interface";
import {
  CreatePlanInput,
  UpdatePlanInput,
  PlansFilters,
} from "@/server/domain/types/plans";

export type { CreatePlanInput, UpdatePlanInput, PlansFilters };

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IPlansRepository extends IBaseRepository<
  Plan,
  CreatePlanInput,
  UpdatePlanInput,
  PlansFilters
> {
  findBySlug(slug: string): Promise<Plan | null>;
}
