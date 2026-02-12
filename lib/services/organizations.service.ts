import { fetchClient } from "@/lib/api-client";
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

export class OrganizationsService {
    private static readonly BASE_PATH = "/api/organizations";

    static async getAll(params: OrganizationPaginationParams = {}) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, String(value));
            }
        });

        const queryString = searchParams.toString();
        const endpoint = queryString ? `${this.BASE_PATH}?${queryString}` : this.BASE_PATH;

        return fetchClient<PageableResponse<Organization>>(endpoint);
    }

    static async getById(id: string) {
        return fetchClient<Organization>(`${this.BASE_PATH}/${id}`);
    }

    static async create(data: CreateOrganizationSchema) {
        return fetchClient<Organization>(this.BASE_PATH, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    static async update(id: string, data: UpdateOrganizationSchema) {
        return fetchClient<Organization>(`${this.BASE_PATH}/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    }

    static async delete(id: string) {
        return fetchClient<void>(`${this.BASE_PATH}/${id}`, {
            method: "DELETE",
        });
    }
}
