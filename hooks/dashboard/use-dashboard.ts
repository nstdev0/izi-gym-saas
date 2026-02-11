import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { DashboardService, DashboardParams } from "@/lib/services/dashboard.service";
import { dashboardKeys, historicStartDateKeys } from "@/lib/react-query/query-keys";

export const useDashboardMetrics = (params: DashboardParams) => {
    return useQuery({
        queryKey: dashboardKeys.metrics(params as Record<string, unknown>),
        queryFn: () => DashboardService.getMetrics(params),
        placeholderData: keepPreviousData,
    });
};

export const useHistoricStartDate = () => {
    return useQuery({
        queryKey: historicStartDateKeys.historicStartDate(),
        queryFn: () => DashboardService.getHistoricStartDate(),
    });
};
