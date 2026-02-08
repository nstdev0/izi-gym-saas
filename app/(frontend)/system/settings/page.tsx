import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { makeQueryClient } from "@/lib/react-query/client-config";
import { systemKeys } from "@/lib/react-query/query-keys";
import { SystemService } from "@/lib/services/system.service";
import SettingsView from "./components/settings-view";

export default async function SystemSettingsPage() {
    const queryClient = makeQueryClient();

    await queryClient.prefetchQuery({
        queryKey: systemKeys.config(),
        queryFn: () => SystemService.getSystemConfig(),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <SettingsView />
        </HydrationBoundary>
    );
}
