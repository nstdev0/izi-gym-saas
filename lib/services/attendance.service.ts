import { fetchClient } from "@/lib/api-client";
import { AttendanceFilters, AttendanceWithMember } from "@/server/application/repositories/attendance.repository.interface";
import { PageableRequest, PageableResponse } from "@/server/shared/common/pagination";

export interface RegisterAttendanceInput {
    memberId: string;
    date: Date;
    method: "QR" | "MANUAL";
}

export class AttendanceService {
    private static readonly BASE_PATH = "/api/attendance";

    static async getAll(params: PageableRequest<AttendanceFilters>) {
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.append("page", String(params.page));
        if (params.limit) searchParams.append("limit", String(params.limit));

        if (params.filters) {
            Object.entries(params.filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    searchParams.append(key, String(value));
                }
            });
        }

        const queryString = searchParams.toString();
        const endpoint = queryString ? `${this.BASE_PATH}?${queryString}` : this.BASE_PATH;

        return fetchClient<PageableResponse<AttendanceWithMember>>(endpoint);
    }

    static async register(data: RegisterAttendanceInput) {
        return fetchClient<void>(this.BASE_PATH, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }
}
