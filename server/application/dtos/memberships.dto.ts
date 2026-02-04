import { z } from "zod";
import { MembershipStatus } from "@/generated/prisma/client";

export const createMembershipSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: z.nativeEnum(MembershipStatus).optional().default("PENDING"),
  pricePaid: z.number().min(0),
  memberId: z.string().cuid(),
  planId: z.string().cuid(),
});

export type CreateMembershipSchema = z.infer<typeof createMembershipSchema>;

export const UpdateMembershipSchema = createMembershipSchema.partial();

export type UpdateMembershipSchema = z.infer<typeof UpdateMembershipSchema>;
