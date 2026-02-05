import { Role } from "@/generated/prisma/enums";
import { z } from "zod";

// Roles permitidos para crear usuarios (excluye GOD)
const AllowedRoles = z.enum(["OWNER", "ADMIN", "STAFF", "TRAINER"]);

export const CreateUserSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Email inválido"),
  role: AllowedRoles.default("STAFF"),
  // Password removed for invitation flow
  isActive: z.boolean().default(true),
  image: z.string().url("URL inválida").optional().or(z.literal("")),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = CreateUserSchema.partial();
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
