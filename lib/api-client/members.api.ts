import { fetchClient } from "@/lib/fetch-client";
import { CreateMemberInput, UpdateMemberInput } from "@/server/application/dtos/members.dto";
import { MembersFilters } from "@/server/application/repositories/members.repository.interface";
import { Member } from "@/server/domain/entities/Member";
import { PageableRequest, PageableResponse } from "@/server/shared/common/pagination";

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

        return fetchClient<PageableResponse<Member>>(endpoint);
    },

    getById: (id: string) => {
        return fetchClient<Member>(`${BASE_API_PATH}/id/${id}`);
    },

    getByQrCode: (qrCode: string) => {
        return fetchClient<Member>(`${BASE_API_PATH}/qr/${qrCode}`);
    },

    create: (data: CreateMemberInput) => {
        return fetchClient<Member>(BASE_API_PATH, {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    update: (id: string, data: UpdateMemberInput) => {
        return fetchClient<Member>(`${BASE_API_PATH}/id/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    },

    delete: (id: string) => {
        return fetchClient<void>(`${BASE_API_PATH}/id/${id}`, {
            method: "DELETE",
        });
    },

    restore: (id: string) => {
        return fetchClient<Member>(`${BASE_API_PATH}/id/${id}/restore`, {
            method: "POST",
        });
    }
}
