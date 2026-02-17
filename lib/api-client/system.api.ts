import { fetchClient } from "@/lib/fetch-client";
import { SystemStats } from "@/shared/types/system.types";
import { Organization } from "@/shared/types/organizations.types";
import { PageableResponse } from "@/shared/types/pagination.types";
import { OrganizationPaginationParams } from "./organizations.api";

const BASE_API_PATH = "/api/system";

export const systemApi = {
    getStats: () => {
        return fetchClient<SystemStats>(`${BASE_API_PATH}/stats`);
    },

    getAllOrganizations: (params: OrganizationPaginationParams = {}) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, String(value));
            }
        });

        const queryString = searchParams.toString();
        const endpoint = queryString ? `${BASE_API_PATH}/organizations?${queryString}` : `${BASE_API_PATH}/organizations`;

        return fetchClient<PageableResponse<Organization>>(endpoint);
    },

    suspendOrganization: (id: string, suspend: boolean) => {
        return fetchClient<void>(`${BASE_API_PATH}/organizations/${id}/suspend`, {
            method: "POST",
            body: JSON.stringify({ suspend }),
        });
    },

    getRecentSignups: () => {
        return fetchClient<Organization[]>(`${BASE_API_PATH}/recent-signups`);
    },

    getRevenueStats: () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return fetchClient<any[]>(`${BASE_API_PATH}/revenue`);
    },

    getSystemConfig: () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return fetchClient<any>(`${BASE_API_PATH}/config`);
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateSystemConfig: (data: any) => {
        return fetchClient<void>(`${BASE_API_PATH}/config`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },

    getPlans: () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return fetchClient<any[]>(`${BASE_API_PATH}/plans`);
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createPlan: (data: any) => {
        return fetchClient<void>(`${BASE_API_PATH}/plans`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updatePlan: (id: string, data: any) => {
        return fetchClient<void>(`${BASE_API_PATH}/plans/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }
}
