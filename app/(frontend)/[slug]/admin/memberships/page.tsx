import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import MembershipsViewPage from "./components/view-page"
import { membershipsApi } from "@/lib/api-client/memberships.api";
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
        page, limit, filters: { search, sort, status: status ?? undefined }
    }

    await queryClient.prefetchQuery({
        queryKey: membershipKeys.list(filters),
        queryFn: () => membershipsApi.getAll(filters),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <MembershipsViewPage />
        </HydrationBoundary>
    );
}
