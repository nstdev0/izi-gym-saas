import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import UsersViewPage from "./components/view-page";
import { UsersService } from "@/lib/services/users.service";
import { userKeys } from "@/lib/react-query/query-keys";
import { makeQueryClient } from "@/lib/react-query/client-config";
import { usersCache } from "@/lib/nuqs/search-params/users";
interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function UsersPage({ searchParams }: PageProps) {
    const { page, limit, ...filters } = await usersCache.parse(searchParams);

    const queryClient = makeQueryClient();

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
        queryFn: () => UsersService.getAll({
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
