import { fetchClient } from "@/lib/fetch-client";
import { CreateMembershipInput, UpdateMembershipInput } from "@/server/application/dtos/memberships.dto";
import { Membership } from "@/server/domain/entities/Membership";
import { MembershipsFilters } from "@/server/domain/types/memberships";
import { PageableRequest, PageableResponse } from "@/server/shared/common/pagination";

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

        return fetchClient<PageableResponse<Membership>>(endpoint);
    },

    getById: (id: string) => {
        return fetchClient<Membership>(`${BASE_API_PATH}/${id}`);
    },

    create: (data: CreateMembershipInput) => {
        return fetchClient<Membership>(BASE_API_PATH, {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    update: (id: string, data: UpdateMembershipInput) => {
        return fetchClient<Membership>(`${BASE_API_PATH}/${id}`, {
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
        return fetchClient<Membership>(`${BASE_API_PATH}/${id}/restore`, {
            method: "POST",
        });
    },

    cancel: (id: string) => {
        return fetchClient<void>(`${BASE_API_PATH}/${id}/cancel`, {
            method: "POST",
        });
    }
}
