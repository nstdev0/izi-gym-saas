import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/react-query/client-config";
import { systemKeys } from "@/lib/react-query/query-keys";
import { SystemService } from "@/lib/services/system.service";
import SystemDashboardView from "./components/view-page";

export default async function SystemDashboardPage() {
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: systemKeys.stats(),
      queryFn: () => SystemService.getStats(),
    }),
    queryClient.prefetchQuery({
      queryKey: systemKeys.recentSignups(),
      queryFn: () => SystemService.getRecentSignups(),
    }),
    queryClient.prefetchQuery({
      queryKey: systemKeys.revenue(),
      queryFn: () => SystemService.getRevenueStats(),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SystemDashboardView />
    </HydrationBoundary>
  );
}
