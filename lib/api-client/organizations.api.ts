import { fetchClient } from "@/lib/fetch-client";
import { CreateOrganizationSchema, UpdateOrganizationSchema } from "@/server/application/dtos/organizations.dto";
import { Organization } from "@/server/domain/entities/Organization";
import { PageableResponse } from "@/server/shared/common/pagination";

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

    create: (data: CreateOrganizationSchema) => {
        return fetchClient<Organization>(BASE_API_PATH, {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    update: (id: string, data: UpdateOrganizationSchema) => {
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
