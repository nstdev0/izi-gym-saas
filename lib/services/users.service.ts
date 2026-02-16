import { fetchClient } from "@/lib/api-client";
import { CreateUserInput, UpdateUserInput } from "@/server/application/dtos/users.dto";
import { User } from "@/server/domain/entities/User";
import { PageableRequest, PageableResponse } from "@/server/shared/common/pagination";
import { UsersFilters } from "@/server/domain/types/users";

export class UsersService {
    private static readonly BASE_PATH = "/api/users";

    static async getAll(params: PageableRequest<UsersFilters>) {
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

        return fetchClient<PageableResponse<User>>(endpoint);
    }

    static async getById(id: string) {
        return fetchClient<User>(`${this.BASE_PATH}/${id}`);
    }

    static async create(data: CreateUserInput) {
        return fetchClient<User>(this.BASE_PATH, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    static async update(id: string, data: UpdateUserInput) {
        return fetchClient<User>(`${this.BASE_PATH}/${id}`, {
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
        return fetchClient<User>(`${this.BASE_PATH}/id/${id}/restore`, {
            method: "POST",
        });
    }
}
