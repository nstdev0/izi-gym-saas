import { fetchClient } from "@/lib/api-client";
import { CreateMembershipInput, UpdateMembershipInput } from "@/server/application/dtos/memberships.dto";
import { Membership } from "@/server/domain/entities/Membership";
import { MembershipsFilters } from "@/server/domain/types/memberships";
import { PageableRequest, PageableResponse } from "@/server/shared/common/pagination";

export interface MembershipWithRelations extends Membership {
    member?: { firstName: string; lastName: string };
    plan?: { name: string };
}

export class MembershipsService {
    private static readonly BASE_PATH = "/api/memberships";

    static async getAll(params: PageableRequest<MembershipsFilters>) {
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.append("page", String(params.page));
        if (params.limit) searchParams.append("limit", String(params.limit));

        if (params.filters) {
            Object.entries(params.filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    searchParams.append(key, String(value));
                }
            });
        }

        const queryString = searchParams.toString();
        const endpoint = queryString ? `${this.BASE_PATH}?${queryString}` : this.BASE_PATH;

        return fetchClient<PageableResponse<MembershipWithRelations>>(endpoint);
    }

    static async getById(id: string) {
        return fetchClient<Membership>(`${this.BASE_PATH}/${id}`);
    }

    static async create(data: CreateMembershipInput) {
        return fetchClient<Membership>(this.BASE_PATH, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    static async update(id: string, data: UpdateMembershipInput) {
        return fetchClient<Membership>(`${this.BASE_PATH}/${id}`, {
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
