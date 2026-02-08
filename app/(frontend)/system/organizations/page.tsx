import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { makeQueryClient } from "@/lib/react-query/client-config";
import { systemKeys } from "@/lib/react-query/query-keys";
import { SystemService } from "@/lib/services/system.service";
import TenantsView from "./components/tenants-view";

export default async function TenantsPage() {
  const queryClient = makeQueryClient();

  await queryClient.prefetchQuery({
    queryKey: systemKeys.organizations({ page: 1, limit: 100 }),
    queryFn: () => SystemService.getAllOrganizations({ page: 1, limit: 100 }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TenantsView />
    </HydrationBoundary>
  );
}
