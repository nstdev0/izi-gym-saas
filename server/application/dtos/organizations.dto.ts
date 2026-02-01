import z from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().min(3),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/),
});

export type CreateOrganizationSchema = z.infer<typeof createOrganizationSchema>;

export const UpdateOrganizationSchema = createOrganizationSchema.partial();

export type UpdateOrganizationSchema = z.infer<typeof UpdateOrganizationSchema>;
