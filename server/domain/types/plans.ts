export interface CreatePlanInput {
  name: string;
  description?: string | null;
  price: number;
  durationDays: number;
  isActive?: boolean;
  limits?: PlanLimits;
}

export type PlanLimits = Record<string, unknown>;

export type UpdatePlanInput = Partial<CreatePlanInput>;

export interface PlansFilters {
  search?: string;
  status?: string;
  sort?: string;
}
