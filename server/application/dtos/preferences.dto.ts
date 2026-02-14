import { z } from "zod";

export const UpdateUserPreferencesSchema = z.object({
    preferences: z.object({
        appearance: z.object({
            font: z.enum(["inter", "outfit", "lato"]),
            theme: z.enum(["light", "dark", "system"]).optional(),
            primaryColor: z.string().optional(),
        }).optional(),
        notifications: z.object({
            email: z.boolean().optional(),
            push: z.boolean().optional(),
        }).optional(),
    }),
});

export type UpdateUserPreferencesInput = z.infer<typeof UpdateUserPreferencesSchema>;
