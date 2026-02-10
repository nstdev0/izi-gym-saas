import { fetchClient } from "@/lib/api-client";
import { CreateMemberInput, UpdateMemberInput } from "@/server/application/dtos/members.dto";
import { Member } from "@/server/domain/entities/Member";
import { PageableResponse } from "@/server/shared/common/pagination";

export interface PaginationParams {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string | null;
    status?: string | null;
}

export class MembersService {
    private static readonly BASE_PATH = "/api/members";

    static async getAll(params: PaginationParams = {}) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, String(value));
            }
        });

        const queryString = searchParams.toString();
        const endpoint = queryString ? `${this.BASE_PATH}?${queryString}` : this.BASE_PATH;

        return fetchClient<PageableResponse<Member>>(endpoint);
    }

    static async getById(id: string) {
        return fetchClient<Member>(`${this.BASE_PATH}/${id}`);
    }

    static async create(data: CreateMemberInput) {
        return fetchClient<Member>(this.BASE_PATH, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    static async update(id: string, data: UpdateMemberInput) {
        return fetchClient<Member>(`${this.BASE_PATH}/${id}`, {
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
