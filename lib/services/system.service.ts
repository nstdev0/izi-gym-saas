import { fetchClient } from "@/lib/api-client";
import { SystemStats } from "@/server/domain/types/system";
import { Organization } from "@/server/domain/entities/Organization";
import { PageableResponse } from "@/server/shared/common/pagination";
import { OrganizationPaginationParams } from "./organizations.service";

export class SystemService {
    private static readonly BASE_PATH = "/api/system";

    static async getStats() {
        return fetchClient<SystemStats>(`${this.BASE_PATH}/stats`);
    }

    static async getAllOrganizations(params: OrganizationPaginationParams = {}) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, String(value));
            }
        });

        const queryString = searchParams.toString();
        const endpoint = queryString ? `${this.BASE_PATH}/organizations?${queryString}` : `${this.BASE_PATH}/organizations`;

        return fetchClient<PageableResponse<Organization>>(endpoint);
    }

    static async suspendOrganization(id: string, suspend: boolean) {
        return fetchClient<void>(`${this.BASE_PATH}/organizations/${id}/suspend`, {
            method: "POST",
            body: JSON.stringify({ suspend }),
        });
    }

    static async getRecentSignups() {
        return fetchClient<Organization[]>(`${this.BASE_PATH}/recent-signups`);
    }

    static async getRevenueStats() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return fetchClient<any[]>(`${this.BASE_PATH}/revenue`);
    }

    static async getSystemConfig() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return fetchClient<any>(`${this.BASE_PATH}/config`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async updateSystemConfig(data: any) {
        return fetchClient<void>(`${this.BASE_PATH}/config`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }

    static async getPlans() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return fetchClient<any[]>(`${this.BASE_PATH}/plans`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async createPlan(data: any) {
        return fetchClient<void>(`${this.BASE_PATH}/plans`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async updatePlan(id: string, data: any) {
        return fetchClient<void>(`${this.BASE_PATH}/plans/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }
}
