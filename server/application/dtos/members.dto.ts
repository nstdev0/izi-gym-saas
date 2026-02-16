import { z } from "zod";
import CapitalizeText from "./helpers/capitalize-text";
import { DocType, Gender } from "@/server/domain/entities/Member";

// --- HELPERS ---
const optionalHeight = z.preprocess(
  (val) => (val === "" ? undefined : val),
  z.coerce.number().min(50, "La altura debe ser mayor a 50 cm").max(300, "La altura debe ser menor a 300 cm").optional()
);

const optionalWeight = z.preprocess(
  (val) => (val === "" ? undefined : val),
  z.coerce.number().min(20, "El peso debe ser mayor a 20 kg").max(500, "El peso debe ser menor a 500 kg").optional()
);

const optionalImc = z.preprocess(
  (val) => (val === "" ? undefined : val),
  z.coerce.number().min(0).optional()
);

// Helper para campos opcionales que deben ser null si están vacíos (evita constraint unique en "")
const optionalEmail = z.preprocess(
  (val) => (val === "" || val === null || val === undefined ? null : val),
  z.string().email("Email inválido").toLowerCase().nullable().optional()
);

const optionalPhone = z.preprocess(
  (val) => (val === "" || val === null || val === undefined ? null : val),
  z.string().trim().regex(/^9\d{8}$/, "El teléfono debe empezar con 9 y tener 9 dígitos").nullable().optional()
);

const optionalUrl = z.preprocess(
  (val) => (val === "" || val === null || val === undefined ? null : val),
  z.string().url("URL inválida").nullable().optional()
);

// --- 1. DEFINIR LA FORMA BASE (Sin Refinements) ---
// Guardamos el objeto puro en una variable para poder reutilizarlo
const MemberBaseSchema = z.object({
  firstName: z
    .string()
    .min(1, "Debes ingresar al menos un nombre")
    .min(2, "El nombre es muy corto")
    .trim()
    .transform((value) => CapitalizeText(value)),

  lastName: z
    .string()
    .min(1, "Debes ingresar al menos un apellido")
    .min(2, "El apellido es muy corto")
    .trim()
    .transform((value) => CapitalizeText(value)),

  docType: z.nativeEnum(DocType, { message: "Tipo de documento inválido" }),

  docNumber: z
    .string()
    .min(1, "Debes ingresar un número de documento")
    .trim(),

  email: optionalEmail,
  phone: optionalPhone,

  birthDate: z.coerce.date()
    .min(new Date("1900-01-01"), "Fecha inválida (muy antigua)")
    .max(new Date(), "La fecha no puede ser futura") // Nadie nace mañana
    .optional()
    // Opcional: Validación de edad mínima (ej: 10 años)
    .refine((date) => {
      if (!date) return true; // Si es opcional y viene vacío, pasa
      const ageDifMs = Date.now() - date.getTime();
      const ageDate = new Date(ageDifMs);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);
      return age >= 5; // Mínimo 5 años de edad
    }, { message: "El miembro debe tener al menos 5 años" }),

  gender: z.nativeEnum(Gender, { message: "Género inválido" }).optional(),

  height: optionalHeight,
  weight: optionalWeight,
  imc: optionalImc,
  image: optionalUrl,
  isActive: z.boolean().default(true),
  qr: z.string(),
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
    if (data.docNumber.length > 11) {
      ctx.addIssue({
        code: "custom",
        path: ["docNumber"],
        message: "El CE debe tener máximo 11 dígitos",
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