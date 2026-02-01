import { z } from "zod";
import CapitalizeText from "./capitalize-text";
import { DocType, Gender } from "@/server/domain/entities/Member";

export const CreateMemberSchema = z.object({
  firstName: z
    .string()
    .min(2, "El nombre es muy corto")
    .trim()
    .transform((value) => CapitalizeText(value)),
  lastName: z
    .string()
    .min(2, "El apellido es muy corto")
    .trim()
    .transform((value) => CapitalizeText(value)),
  docType: z.nativeEnum(DocType),
  docNumber: z.string().min(8, "El número de documento es muy corto"),
  email: z.email().toLowerCase().optional().or(z.literal("")),
  phone: z
    .string()
    .regex(/^9\d{8}$/, "El teléfono debe tener 9 dígitos y comenzar con 9")
    .optional()
    .or(z.literal("")),
  birthDate: z.coerce.date().optional(),
  gender: z.nativeEnum(Gender).optional(),
  height: z.coerce.number().min(0).optional(),
  weight: z.coerce.number().min(0).optional(),
  imc: z.coerce.number().min(0).optional(),
  image: z.url().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

export const UpdateMemberSchema = CreateMemberSchema.partial().omit({
  docType: true,
  docNumber: true,
});

export type CreateMemberInput = z.infer<typeof CreateMemberSchema>;

export type UpdateMemberInput = z.infer<typeof UpdateMemberSchema>;
