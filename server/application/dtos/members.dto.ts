import { z } from "zod";
import CapitalizeText from "./capitalize-text";
import { DocType, Gender } from "@/server/domain/entities/Member";

// --- HELPERS ---
const optionalString = z.string().trim().transform(val => val === "" ? undefined : val).optional();
const optionalNumber = z.preprocess(
  (val) => (val === "" ? undefined : val),
  z.coerce.number().min(0).optional()
);

// --- 1. DEFINIR LA FORMA BASE (Sin Refinements) ---
// Guardamos el objeto puro en una variable para poder reutilizarlo
const MemberBaseSchema = z.object({
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

  docType: z.nativeEnum(DocType, { message: "Tipo de documento inválido" }),

  docNumber: z
    .string()
    .regex(/^\d+$/, "Solo se permiten números")
    .trim(),

  email: z.string().email("Email inválido").optional().or(z.literal("")),

  phone: z
    .string()
    .trim()
    .regex(/^9\d{8}$/, "El teléfono debe empezar con 9 y tener 9 dígitos")
    .optional()
    .or(z.literal("")),

  birthDate: z.coerce.date().optional(),
  gender: z.nativeEnum(Gender, { message: "Género inválido" }).optional(),
  height: optionalNumber,
  weight: optionalNumber,
  imc: optionalNumber,
  image: z.string().url("URL inválida").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

// --- 2. LOGICA DE REFINAMIENTO (Separada) ---
const validateDocuments = (data: { docType: DocType; docNumber: string }, ctx: z.RefinementCtx) => {
  // Caso DNI
  if (data.docType === DocType.DNI) {
    if (data.docNumber.length !== 8) {
      ctx.addIssue({
        code: "custom",
        path: ["docNumber"],
        message: "El DNI debe tener exactamente 8 dígitos",
      });
    }
  }

  // Caso RUC
  if (data.docType === DocType.RUC) {
    if (data.docNumber.length !== 11) {
      ctx.addIssue({
        code: "custom",
        path: ["docNumber"],
        message: "El RUC debe tener exactamente 11 dígitos",
      });
    }
  }

  // Caso CE
  if (data.docType === DocType.CE) {
    if (data.docNumber.length !== 9) {
      ctx.addIssue({
        code: "custom",
        path: ["docNumber"],
        message: "El CE debe tener exactamente 9 dígitos",
      });
    }
  }

  // Caso PASSPORT
  if (data.docType === DocType.PASSPORT) {
    if (data.docNumber.length < 6 || data.docNumber.length > 12) {
      ctx.addIssue({
        code: "custom",
        path: ["docNumber"],
        message: "El pasaporte debe tener entre 6 y 12 caracteres",
      });
    }
  }
};

// --- 3. SCHEMA DE CREACIÓN (Base + Refinements) ---
export const CreateMemberSchema = MemberBaseSchema.superRefine(validateDocuments);

// --- 4. SCHEMA DE ACTUALIZACIÓN (Base + Partial) ---
// AQUÍ ESTÁ LA SOLUCIÓN: Usamos MemberBaseSchema, NO CreateMemberSchema
export const UpdateMemberSchema = MemberBaseSchema
  .partial() // Hacemos todo opcional primero
  .omit({    // Quitamos lo que no se debe editar
    docType: true,
    docNumber: true,
  });
// Nota: Al omitir docType y docNumber, ya no necesitamos el superRefine
// porque no estamos validando esos campos en el update.

// --- 5. TIPOS INFERIDOS ---
export type CreateMemberInput = z.infer<typeof CreateMemberSchema>;
export type UpdateMemberInput = z.infer<typeof UpdateMemberSchema>;