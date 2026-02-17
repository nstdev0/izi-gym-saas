import { HydrationBoundary, dehydrate, QueryClient } from "@tanstack/react-query";
import { DashboardService } from "@/lib/services/dashboard.service";
import { dashboardKeys } from "@/lib/react-query/query-keys";
import { startOfYear, endOfYear } from "date-fns";
import DashboardViewPage from "./components/view-page";

export default async function DashboardPage() {
    const queryClient = new QueryClient();

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
        queryFn: () => DashboardService.getMetrics(params),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <DashboardViewPage />
        </HydrationBoundary>
    );
}
