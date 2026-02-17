import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { dashboardApi, DashboardParams } from "@/lib/api-client/dashboard.api";
import { dashboardKeys, historicStartDateKeys } from "@/lib/react-query/query-keys";

export const useDashboardMetrics = (params: DashboardParams) => {
    return useQuery({
        queryKey: dashboardKeys.metrics(params as Record<string, unknown>),
        queryFn: () => dashboardApi.getMetrics(params),
        placeholderData: keepPreviousData,
    });
};

export const useHistoricStartDate = () => {
    return useQuery({
        queryKey: historicStartDateKeys.historicStartDate(),
        queryFn: () => dashboardApi.getHistoricStartDate(),
    });
};
