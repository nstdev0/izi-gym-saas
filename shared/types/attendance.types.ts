import { BaseEntity, BaseResponse } from "./common.types";
import { Member } from "./members.types";
import { z } from "zod";

export interface Attendance extends BaseEntity {
    memberId: string;
    date: Date;
    method: string;
    member?: Member;
}

export interface AttendanceResponse extends BaseResponse {
    memberId: string;
    date: string | Date;
    method: string;
    member?: Member;
}

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

export interface AttendanceFilters {
    search?: string;
    sort?: string;
    method?: "QR" | "MANUAL" | null;
}
