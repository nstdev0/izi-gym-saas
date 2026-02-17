import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/react-query/client-config";
import { systemKeys } from "@/lib/react-query/query-keys";
import { systemApi } from "@/lib/api-client/system.api";
import SettingsView from "./components/settings-view";

export default async function SystemSettingsPage() {
    const queryClient = getQueryClient();

    await queryClient.prefetchQuery({
        queryKey: systemKeys.config(),
        queryFn: () => systemApi.getSystemConfig(),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <SettingsView />
        </HydrationBoundary>
    );
}
