import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import MembershipsViewPage from "./components/view-page"
import { MembershipsService } from "@/lib/services/memberships.service";
import { membershipKeys } from "@/lib/react-query/query-keys";
import { getQueryClient } from "@/lib/react-query/client-config";
import { membershipsSearchParamsCache } from "@/lib/nuqs/search-params/memberships";

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MembershipsPage({ searchParams }: PageProps) {
    const queryClient = getQueryClient();

    const { page, limit, search, sort, status } = await membershipsSearchParamsCache.parse(searchParams)

    const filters = {
        page, limit, filters: { search, sort, status }
    }

    await queryClient.prefetchQuery({
        queryKey: membershipKeys.list(filters),
        queryFn: () => MembershipsService.getAll(filters),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <MembershipsViewPage />
        </HydrationBoundary>
    );
}
