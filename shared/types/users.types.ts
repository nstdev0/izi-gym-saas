import { BaseEntity, BaseResponse } from "./common.types";
import { z } from "zod";

export enum Role {
    GOD = "GOD",
    OWNER = "OWNER",
    ADMIN = "ADMIN",
    STAFF = "STAFF",
    TRAINER = "TRAINER",
}

export interface User extends BaseEntity {
    firstName: string | null;
    lastName: string | null;
    email: string;
    role: string;
    isActive: boolean;
    image: string | null;
    preferences: Record<string, unknown> | null;
}

export interface UserResponse extends BaseResponse {
    firstName: string | null;
    lastName: string | null;
    email: string;
    role: string;
    isActive: boolean;
    image: string | null;
    preferences: Record<string, unknown> | null;
}

const AllowedRoles = z.nativeEnum(Role);

export const CreateUserSchema = z.object({
    id: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email("Email inválido"),
    role: AllowedRoles.default(Role.STAFF),
    isActive: z.boolean().default(true),
    image: z.string().url("URL inválida").optional().or(z.literal("")),
    organizationId: z.string().optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = CreateUserSchema.partial();
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

export interface UsersFilters {
    search?: string;
    sort?: string;
    role?: string;
    status?: string
}
