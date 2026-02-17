import { BaseEntity } from "./common.types";
import { z } from "zod";
import { capitalizeText } from "../utils/text.utils";
import { Membership } from "./memberships.types";

export enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    OTHER = "OTHER",
}

export enum DocType {
    DNI = "DNI",
    CE = "CE",
    PASSPORT = "PASSPORT",
    RUC = "RUC",
}

export interface Member extends BaseEntity {
    firstName: string;
    lastName: string;
    docType: DocType;
    docNumber: string;
    isActive: boolean;
    qr: string;
    email?: string | null;
    phone?: string | null;
    birthDate?: Date | null;
    gender?: Gender | null;
    height?: number | null;
    weight?: number | null;
    imc?: number | null;
    image?: string | null;
    memberships?: Membership[];
    fullName?: string;
}

export interface MembersFilters {
    search?: string;
    sort?: string;
    status?: string;
}

// --- Zod Schemas ---

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

const MemberBaseSchema = z.object({
    firstName: z
        .string()
        .min(1, "Debes ingresar al menos un nombre")
        .min(2, "El nombre es muy corto")
        .trim()
        .transform((value) => capitalizeText(value)),

    lastName: z
        .string()
        .min(1, "Debes ingresar al menos un apellido")
        .min(2, "El apellido es muy corto")
        .trim()
        .transform((value) => capitalizeText(value)),

    docType: z.nativeEnum(DocType, { message: "Tipo de documento inválido" }),

    docNumber: z
        .string()
        .min(1, "Debes ingresar un número de documento")
        .trim(),

    email: optionalEmail,
    phone: optionalPhone,

    birthDate: z.coerce.date()
        .min(new Date("1900-01-01"), "Fecha inválida (muy antigua)")
        .max(new Date(), "La fecha no puede ser futura")
        .optional()
        .refine((date) => {
            if (!date) return true;
            const ageDifMs = Date.now() - date.getTime();
            const ageDate = new Date(ageDifMs);
            const age = Math.abs(ageDate.getUTCFullYear() - 1970);
            return age >= 5;
        }, { message: "El miembro debe tener al menos 5 años" }),

    gender: z.nativeEnum(Gender, { message: "Género inválido" }).optional(),

    height: optionalHeight,
    weight: optionalWeight,
    imc: optionalImc,
    image: optionalUrl,
    isActive: z.boolean().default(true),
    qr: z.string(),
});

const validateDocuments = (data: { docType: DocType; docNumber: string }, ctx: z.RefinementCtx) => {
    if (data.docType === DocType.DNI) {
        if (data.docNumber.length !== 8) {
            ctx.addIssue({
                code: "custom",
                path: ["docNumber"],
                message: "El DNI debe tener exactamente 8 dígitos",
            });
        }
    }

    if (data.docType === DocType.RUC) {
        if (data.docNumber.length !== 11) {
            ctx.addIssue({
                code: "custom",
                path: ["docNumber"],
                message: "El RUC debe tener exactamente 11 dígitos",
            });
        }
    }

    if (data.docType === DocType.CE) {
        if (data.docNumber.length > 11) {
            ctx.addIssue({
                code: "custom",
                path: ["docNumber"],
                message: "El CE debe tener máximo 11 dígitos",
            });
        }
    }

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

export const CreateMemberSchema = MemberBaseSchema.superRefine(validateDocuments);

export const UpdateMemberSchema = MemberBaseSchema
    .partial()
    .omit({
        docType: true,
        docNumber: true,
    });

export type CreateMemberInput = z.infer<typeof CreateMemberSchema>;
export type UpdateMemberInput = z.infer<typeof UpdateMemberSchema>;
