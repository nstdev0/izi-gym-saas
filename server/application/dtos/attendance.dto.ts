import { z } from "zod";

export const RegisterAttendanceSchema = z.object({
    memberId: z.string().min(1, "Member ID is required"),
    date: z.coerce.date(),
    method: z.enum(["QR", "MANUAL"]).default("QR"),
});

export type RegisterAttendanceInput = z.infer<typeof RegisterAttendanceSchema>;
