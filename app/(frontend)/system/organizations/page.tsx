import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/react-query/client-config";
import { systemKeys } from "@/lib/react-query/query-keys";
import { systemApi } from "@/lib/api-client/system.api";
import TenantsView from "./components/tenants-view";

export default async function TenantsPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: systemKeys.organizations({ page: 1, limit: 100 }),
    queryFn: () => systemApi.getAllOrganizations({ page: 1, limit: 100 }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TenantsView />
    </HydrationBoundary>
  );
}
