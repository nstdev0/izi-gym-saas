import { fetchClient } from "@/lib/fetch-client";
import { CreateMembershipInput, UpdateMembershipInput, MembershipResponse } from "@/shared/types/memberships.types";
import { MembershipsFilters } from "@/shared/types/memberships.types";
import { PageableRequest, PageableResponse } from "@/shared/types/pagination.types";

const BASE_API_PATH = "/api/memberships";

export const membershipsApi = {
    getAll: (params: PageableRequest<MembershipsFilters>) => {
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.append("page", String(params.page));
        if (params.limit) searchParams.append("limit", String(params.limit));

        if (params.filters) {
            Object.entries(params.filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    searchParams.append(key, String(value));
                }
            });
        }

        const queryString = searchParams.toString();
        const endpoint = queryString ? `${BASE_API_PATH}?${queryString}` : BASE_API_PATH;

        return fetchClient<PageableResponse<MembershipResponse>>(endpoint);
    },

    getById: (id: string) => {
        return fetchClient<MembershipResponse>(`${BASE_API_PATH}/${id}`);
    },

    create: (data: CreateMembershipInput) => {
        return fetchClient<MembershipResponse>(BASE_API_PATH, {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    update: (id: string, data: UpdateMembershipInput) => {
        return fetchClient<MembershipResponse>(`${BASE_API_PATH}/${id}`, {
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
        return fetchClient<MembershipResponse>(`${BASE_API_PATH}/${id}/restore`, {
            method: "POST",
        });
    },

    cancel: (id: string) => {
        return fetchClient<void>(`${BASE_API_PATH}/${id}/cancel`, {
            method: "POST",
        });
    }
}
