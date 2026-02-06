export interface CreatePlanInput {
  name: string;
  description?: string | null;
  price: number;
  durationDays: number;
  isActive?: boolean;
}

export type UpdatePlanInput = Partial<CreatePlanInput>;

export interface PlansFilters {
  search?: string;
  status?: string;
  sort?: string;
}
