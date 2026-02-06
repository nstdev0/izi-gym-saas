import { z } from "zod";

export const createPlanSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional().nullable(),
  price: z.coerce.number().min(0, "El precio no puede ser negativo"),
  durationDays: z.coerce.number().int().min(1, "La duración debe ser al menos 1 día"),
  isActive: z.boolean().optional(),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;

export const UpdatePlanSchema = createPlanSchema.partial();

export type UpdatePlanInput = z.infer<typeof UpdatePlanSchema>;
