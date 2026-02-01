import { Role } from "@/generated/prisma/enums";
import { z } from "zod";

export const CreateUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email(),
  passwordHash: z.string().min(6).optional(), // Optional if using external auth
  role: z.enum(Role).default("STAFF"), // use nativeEnum for Prisma Enums
  isActive: z.boolean().default(true),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = CreateUserSchema.partial();
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
