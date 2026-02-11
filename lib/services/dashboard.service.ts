import { fetchClient } from "@/lib/api-client";
import { DashboardMetrics } from "@/server/domain/entities/dashboard-metrics";

export interface DashboardParams {
    from?: string;
    to?: string;
    grouping?: 'day' | 'month' | 'year';
}

export const DashboardService = {
    getMetrics: async (params: DashboardParams): Promise<DashboardMetrics> => {
        const queryParams = new URLSearchParams();
        if (params.from) queryParams.set("from", params.from);
        if (params.to) queryParams.set("to", params.to);
        if (params.grouping) queryParams.set("grouping", params.grouping);

        return fetchClient<DashboardMetrics>(`/api/dashboard?${queryParams.toString()}`);
    },

    getHistoricStartDate: async (): Promise<Date> => {
        return fetchClient<Date>(`/api/dashboard/historic-start-date`);
    },
};
