import { BaseEntity } from "./common.types";
import { z } from "zod";

export enum MembershipStatus {
    ACTIVE = "ACTIVE",
    EXPIRED = "EXPIRED",
    PENDING = "PENDING",
    CANCELLED = "CANCELLED",
}

export interface Membership extends BaseEntity {
    startDate: Date;
    endDate: Date;
    pricePaid: number;
    memberId: string;
    planId: string;
    memberName?: string;
    planName?: string;
    // Simplified relations for frontend display if needed
    member?: { firstName: string; lastName: string; image: string | null; docNumber: string; };
    plan?: { name: string; };
}

export const createMembershipSchema = z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    status: z.nativeEnum(MembershipStatus).optional().default(MembershipStatus.PENDING),
    pricePaid: z.coerce.number().min(0),
    memberId: z.string().min(1, "El miembro es requerido"),
    planId: z.string().min(1, "El plan es requerido"),
});

export const UpdateMembershipSchema = createMembershipSchema.partial();
export type CreateMembershipInput = z.infer<typeof createMembershipSchema>;
export type UpdateMembershipInput = z.infer<typeof UpdateMembershipSchema>;

export interface MembershipsFilters {
    status?: string;
    memberId?: string;
    planId?: string;
    search?: string;
    sort?: string;
}
