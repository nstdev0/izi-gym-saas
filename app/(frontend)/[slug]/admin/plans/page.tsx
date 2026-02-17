import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import PlansViewPage from "./components/view-page";
import { PlansService } from "@/lib/services/plans.service";
import { planKeys } from "@/lib/react-query/query-keys";
import { getQueryClient } from "@/lib/react-query/client-config";

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PlansPage({ searchParams }: PageProps) {
    const queryClient = getQueryClient();
    const params = await searchParams;

    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const search = (params.search as string) || undefined;
    const sort = (params.sort as string) || undefined;
    const status = (params.status as string) || undefined;

    const filters = {
        page,
        limit,
        search,
        sort,
        status,
    };

    await queryClient.prefetchQuery({
        queryKey: planKeys.list({
            page,
            limit,
            filters: {
                search: filters.search ?? undefined,
                sort: filters.sort ?? undefined,
                status: filters.status ?? undefined,
            }
        }),
        queryFn: () => PlansService.getAll({
            page,
            limit,
            filters: {
                search: filters.search ?? undefined,
                sort: filters.sort ?? undefined,
                status: filters.status ?? undefined,
            }
        }),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <PlansViewPage />
        </HydrationBoundary>
    );
}
