import { fetchClient } from "@/lib/fetch-client";
import { CreateUserInput, UpdateUserInput, UserResponse } from "@/shared/types/users.types";
import { PageableRequest, PageableResponse } from "@/shared/types/pagination.types";
import { UsersFilters } from "@/shared/types/users.types";

const BASE_API_PATH = "/api/users";

export const usersApi = {
    getAll: (params: PageableRequest<UsersFilters>) => {
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

        return fetchClient<PageableResponse<UserResponse>>(endpoint);
    },

    getProfile: () => {
        return fetchClient<UserResponse>(`${BASE_API_PATH}/profile`);
    },

    getById: (id: string) => {
        return fetchClient<UserResponse>(`${BASE_API_PATH}/${id}`);
    },

    create: (data: CreateUserInput) => {
        return fetchClient<UserResponse>(BASE_API_PATH, {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    update: (id: string, data: UpdateUserInput) => {
        return fetchClient<UserResponse>(`${BASE_API_PATH}/${id}`, {
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
        return fetchClient<UserResponse>(`${BASE_API_PATH}/id/${id}/restore`, {
            method: "POST",
        });
    }
}
