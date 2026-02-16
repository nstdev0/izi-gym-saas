import { fetchClient } from "@/lib/api-client";
import { CreatePlanInput, UpdatePlanInput } from "@/server/application/dtos/plans.dto";
import { Plan } from "@/server/domain/entities/Plan";
import { PageableRequest, PageableResponse } from "@/server/shared/common/pagination";
import { PlansFilters } from "@/server/domain/types/plans";

export class PlansService {
    private static readonly BASE_PATH = "/api/plans";

    static async getAll(params: PageableRequest<PlansFilters>) {
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

        return fetchClient<PageableResponse<Plan>>(endpoint);
    }

    static async getById(id: string) {
        return fetchClient<Plan>(`${this.BASE_PATH}/${id}`);
    }

    static async create(data: CreatePlanInput) {
        return fetchClient<Plan>(this.BASE_PATH, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    static async update(id: string, data: UpdatePlanInput) {
        return fetchClient<Plan>(`${this.BASE_PATH}/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    }

    static async delete(id: string) {
        return fetchClient<void>(`${this.BASE_PATH}/${id}`, {
            method: "DELETE",
        });
    }

    static async restore(id: string) {
        return fetchClient<Plan>(`${this.BASE_PATH}/id/${id}/restore`, {
            method: "POST",
        });
    }
}
