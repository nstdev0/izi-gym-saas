import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api-client/dashboard.api";
import { dashboardKeys } from "@/lib/react-query/query-keys";
import { startOfYear, endOfYear } from "date-fns";
import DashboardViewPage from "./components/view-page";
import { getQueryClient } from "@/lib/react-query/client-config";

export default async function DashboardPage() {
    const queryClient = getQueryClient();

    const initialDate = {
        from: startOfYear(new Date()).toISOString(),
        to: endOfYear(new Date()).toISOString(),
    };
    const initialGrouping: 'day' | 'month' | 'year' = 'month';

    const params = {
        from: initialDate.from,
        to: initialDate.to,
        grouping: initialGrouping,
    };

    await queryClient.prefetchQuery({
        queryKey: dashboardKeys.metrics(params),
        queryFn: () => dashboardApi.getMetrics(params),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <DashboardViewPage />
        </HydrationBoundary>
    );
}
