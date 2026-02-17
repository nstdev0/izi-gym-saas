import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import UsersViewPage from "./components/view-page";
import { usersApi } from "@/lib/api-client/users.api";
import { userKeys } from "@/lib/react-query/query-keys";
import { getQueryClient } from "@/lib/react-query/client-config";
import { usersCache } from "@/lib/nuqs/search-params/users";
interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function UsersPage({ searchParams }: PageProps) {
    const { page, limit, ...filters } = await usersCache.parse(searchParams);

    const queryClient = getQueryClient();

    await queryClient.prefetchQuery({
        queryKey: userKeys.list({
            page,
            limit,
            filters: {
                search: filters.search ?? undefined,
                sort: filters.sort ?? undefined,
                role: filters.role ?? undefined,
                status: filters.status ?? undefined,
            }
        }),
        queryFn: () => usersApi.getAll({
            page,
            limit,
            filters: {
                search: filters.search ?? undefined,
                sort: filters.sort ?? undefined,
                role: filters.role ?? undefined,
                status: filters.status ?? undefined,
            }
        }),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <UsersViewPage />
        </HydrationBoundary>
    );
}
