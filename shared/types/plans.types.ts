import { BaseEntity } from "./common.types";
import { z } from "zod";
import { capitalizeText } from "../utils/text.utils";

export interface Plan extends BaseEntity {
    name: string;
    description: string | null;
    price: number;
    durationDays: number;
    isActive: boolean;
    image?: string | null;
}

export const createPlanSchema = z.object({
    name: z.string().min(1, "El nombre es requerido").transform((value) => capitalizeText(value)),
    description: z.string().optional().nullable(),
    price: z.coerce.number({
        invalid_type_error: "El precio es requerido",
        required_error: "El precio es requerido"
    }).min(0, "El precio no puede ser negativo").positive(),
    durationDays: z.coerce.number().int().min(1, "La duración debe ser al menos 1 día"),
    isActive: z.boolean().optional(),
});

export const UpdatePlanSchema = createPlanSchema.partial();
export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof UpdatePlanSchema>;

export type PlanLimits = Record<string, unknown>;

export interface PlansFilters {
    search?: string;
    status?: string;
    sort?: string;
}
