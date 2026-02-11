import { z } from "zod";

export const RegisterAttendanceSchema = z.object({
    memberId: z.string().min(1, "Member ID is required"),
    date: z.coerce.date(),
    method: z.enum(["QR", "MANUAL"]).default("QR"),
});

export type RegisterAttendanceInput = z.infer<typeof RegisterAttendanceSchema>;

export const UpdateAttendanceSchema = z.object({
    date: z.coerce.date(),
    method: z.enum(["QR", "MANUAL"]),
}).partial();

export type UpdateAttendanceInput = z.infer<typeof UpdateAttendanceSchema>;

