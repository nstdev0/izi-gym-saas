import { fetchClient } from "@/lib/fetch-client";
import { DashboardMetrics } from "@/shared/types/dashboard.types";

export interface DashboardParams {
    from?: string;
    to?: string;
    grouping?: 'day' | 'month' | 'year';
}

const BASE_API_PATH = "/api/dashboard";

export const dashboardApi = {
    getMetrics: async (params: DashboardParams): Promise<DashboardMetrics> => {
        const queryParams = new URLSearchParams();
        if (params.from) queryParams.set("from", params.from);
        if (params.to) queryParams.set("to", params.to);
        if (params.grouping) queryParams.set("grouping", params.grouping);

        return fetchClient<DashboardMetrics>(`${BASE_API_PATH}?${queryParams.toString()}`);
    },

    getHistoricStartDate: async (): Promise<Date> => {
        return fetchClient<Date>(`${BASE_API_PATH}/historic-start-date`);
    },
};
