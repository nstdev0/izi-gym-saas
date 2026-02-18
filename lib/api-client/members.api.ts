import { fetchClient } from "@/lib/fetch-client";
import { CreateMemberInput, UpdateMemberInput, MemberResponse } from "@/shared/types/members.types";
import { MembersFilters } from "@/shared/types/members.types";
import { PageableRequest, PageableResponse } from "@/shared/types/pagination.types";

const BASE_API_PATH = "/api/members";

export const membersApi = {
    getAll: (params: PageableRequest<MembersFilters>) => {
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

        return fetchClient<PageableResponse<MemberResponse>>(endpoint);
    },

    getById: (id: string) => fetchClient<MemberResponse>(`${BASE_API_PATH}/id/${id}`),

    getByQrCode: (qrCode: string) => fetchClient<MemberResponse>(`${BASE_API_PATH}/qr/${qrCode}`),

    create: (data: CreateMemberInput) => fetchClient<MemberResponse>(BASE_API_PATH, { method: "POST", body: JSON.stringify(data) }),

    update: (id: string, data: UpdateMemberInput) =>
        fetchClient<MemberResponse>(`${BASE_API_PATH}/id/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

    delete: (id: string) => fetchClient<void>(`${BASE_API_PATH}/id/${id}`, { method: "DELETE" }),

    restore: (id: string) => fetchClient<MemberResponse>(`${BASE_API_PATH}/id/${id}/restore`, { method: "POST" }),
}