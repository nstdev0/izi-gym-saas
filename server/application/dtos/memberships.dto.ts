import { z } from "zod";

export enum MembershipStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED"
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
