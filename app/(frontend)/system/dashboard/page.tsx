import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/react-query/client-config";
import { systemKeys } from "@/lib/react-query/query-keys";
import { systemApi } from "@/lib/api-client/system.api";
import SystemDashboardView from "./components/view-page";

export default async function SystemDashboardPage() {
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: systemKeys.stats(),
      queryFn: () => systemApi.getStats(),
    }),
    queryClient.prefetchQuery({
      queryKey: systemKeys.recentSignups(),
      queryFn: () => systemApi.getRecentSignups(),
    }),
    queryClient.prefetchQuery({
      queryKey: systemKeys.revenue(),
      queryFn: () => systemApi.getRevenueStats(),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SystemDashboardView />
    </HydrationBoundary>
  );
}
