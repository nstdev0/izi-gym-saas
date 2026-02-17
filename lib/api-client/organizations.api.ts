import { fetchClient } from "@/lib/fetch-client";
import { CreateOrganizationInput, UpdateOrganizationInput } from "@/shared/types/organizations.types";
import { Organization } from "@/shared/types/organizations.types";
import { PageableResponse } from "@/shared/types/pagination.types";

export interface OrganizationPaginationParams {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    status?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

const BASE_API_PATH = "/api/organizations";

export const organizationsApi = {
    getAll: (params: OrganizationPaginationParams = {}) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, String(value));
            }
        });

        const queryString = searchParams.toString();
        const endpoint = queryString ? `${BASE_API_PATH}?${queryString}` : BASE_API_PATH;

        return fetchClient<PageableResponse<Organization>>(endpoint);
    },

    getById: (id: string) => {
        return fetchClient<Organization>(`${BASE_API_PATH}/${id}`);
    },

    create: (data: CreateOrganizationInput) => {
        return fetchClient<Organization>(BASE_API_PATH, {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    update: (id: string, data: UpdateOrganizationInput) => {
        return fetchClient<Organization>(`${BASE_API_PATH}/${id}`, {
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
        return fetchClient<Organization>(`${BASE_API_PATH}/id/${id}/restore`, {
            method: "POST",
        });
    }
}
