import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import OrganizationsViewPage from "./components/view-page";
import { OrganizationsService } from "@/lib/services/organizations.service";
import { organizationKeys } from "@/lib/react-query/query-keys";
import { getQueryClient } from "@/lib/react-query/client-config";

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OrganizationsPage({ searchParams }: PageProps) {
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
        queryKey: organizationKeys.list(filters),
        queryFn: () => OrganizationsService.getAll(filters),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <OrganizationsViewPage />
        </HydrationBoundary>
    );
}
