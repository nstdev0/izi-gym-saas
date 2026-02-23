import { fetchClient } from "@/lib/fetch-client";
import { AttendanceFilters, AttendanceResponse, Attendance } from "@/shared/types/attendance.types";
import { UpdateAttendanceInput } from "@/shared/types/attendance.types";
import { PageableRequest, PageableResponse } from "@/shared/types/pagination.types";

export interface RegisterAttendanceInput {
    memberId: string;
    date: Date;
    method: "QR" | "MANUAL";
}

const BASE_API_PATH = "/api/attendance";

export const attendanceApi = {

    getAll: (params: PageableRequest<AttendanceFilters>) => {
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
        const endpoint = queryString ? `${BASE_API_PATH}?${queryString}` : BASE_API_PATH;

        return fetchClient<PageableResponse<AttendanceResponse>>(endpoint);
    },

    register: (data: RegisterAttendanceInput) => {
        return fetchClient<void>(BASE_API_PATH, {
            method: "POST",
            body: JSON.stringify(data),
        })
    },

    getById: (id: string) => {
        return fetchClient<AttendanceResponse>(`${BASE_API_PATH}/${id}`);
    },

    update: (id: string, data: UpdateAttendanceInput) => {
        return fetchClient<AttendanceResponse>(`${BASE_API_PATH}/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    },

    delete: (id: string) => {
        return fetchClient<void>(`${BASE_API_PATH}/${id}`, {
            method: "DELETE",
        });
    },

    restore: (id: string) => {
        return fetchClient<AttendanceResponse>(`${BASE_API_PATH}/id/${id}/restore`, {
            method: "POST",
        });
    }
}