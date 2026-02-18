import { fetchClient } from "@/lib/fetch-client";
import { CreatePlanInput, UpdatePlanInput, PlanResponse } from "@/shared/types/plans.types";
import { PageableRequest, PageableResponse } from "@/shared/types/pagination.types";
import { PlansFilters } from "@/shared/types/plans.types";

const BASE_API_PATH = "/api/plans";

export const plansApi = {
    getAll: (params: PageableRequest<PlansFilters>) => {
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

        return fetchClient<PageableResponse<PlanResponse>>(endpoint);
    },

    getById: (id: string) => {
        return fetchClient<PlanResponse>(`${BASE_API_PATH}/${id}`);
    },

    create: (data: CreatePlanInput) => {
        return fetchClient<PlanResponse>(BASE_API_PATH, {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    update: (id: string, data: UpdatePlanInput) => {
        return fetchClient<PlanResponse>(`${BASE_API_PATH}/${id}`, {
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
        return fetchClient<PlanResponse>(`${BASE_API_PATH}/id/${id}/restore`, {
            method: "POST",
        });
    }
}
