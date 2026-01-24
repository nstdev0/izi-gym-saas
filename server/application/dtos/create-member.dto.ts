import { z } from "zod";

export const CreateMemberSchema = z.object({
  firstName: z.string().min(2, "El nombre es muy corto"),
  lastName: z.string().min(2, "El apellido es muy corto"),
  email: z.string().email(),
  phone: z
    .string()
    .regex(/^9\d{8}$/, "El teléfono debe tener 9 dígitos y comenzar con 9"),
  docNumber: z.string().min(8, "El número de documento es muy corto"),
});

export type CreateMemberInput = z.infer<typeof CreateMemberSchema>;

export const UpdateMemberSchema = z.object({
  firstName: z.string().min(2, "El nombre es muy corto"),
  lastName: z.string().min(2, "El apellido es muy corto"),
  email: z.string().email(),
  phone: z
    .string()
    .regex(/^9\d{8}$/, "El teléfono debe tener 9 dígitos y comenzar con 9"),
  docNumber: z.string().min(8, "El número de documento es muy corto"),
});

export type UpdateMemberInput = z.infer<typeof UpdateMemberSchema>;
