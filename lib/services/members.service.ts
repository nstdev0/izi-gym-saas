import { fetchClient } from "@/lib/api-client";
import { CreateMemberInput, UpdateMemberInput } from "@/server/application/dtos/members.dto";
import { MembersFilters } from "@/server/application/repositories/members.repository.interface";
import { Member } from "@/server/domain/entities/Member";
import { PageableRequest, PageableResponse } from "@/server/shared/common/pagination";

export class MembersService {
    private static readonly BASE_PATH = "/api/members";

    static async getAll(params: PageableRequest<MembersFilters>) {
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

        return fetchClient<PageableResponse<Member>>(endpoint);
    }

    static async getById(id: string) {
        return fetchClient<Member>(`${this.BASE_PATH}/id/${id}`);
    }

    static async getByQrCode(qrCode: string) {
        return fetchClient<Member>(`${this.BASE_PATH}/qr/${qrCode}`);
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
