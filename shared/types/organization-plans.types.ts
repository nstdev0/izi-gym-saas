import { BaseEntity } from "./common.types";
import { z } from "zod";

export interface OrganizationPlan extends BaseEntity {
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    price: number;
    currency: string;
    limits: Record<string, unknown>;
    stripePriceId: string | null;
    isActive: boolean;
}

export const createOrganizationPlanSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    slug: z.string().min(1),
    description: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
    price: z.number().min(0, "El precio debe ser mayor a 0"),
    currency: z.string().default("USD"),
    limits: z.record(z.unknown()).default({}),
    isActive: z.boolean().default(true),
});

export type CreateOrganizationPlanInput = z.infer<typeof createOrganizationPlanSchema>;
export const UpdateOrganizationPlanSchema = createOrganizationPlanSchema.partial();
export type UpdateOrganizationPlanInput = z.infer<typeof UpdateOrganizationPlanSchema>;
