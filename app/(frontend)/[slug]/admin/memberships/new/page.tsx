import { getQueryClient } from "@/lib/react-query/client-config";
import { memberKeys, planKeys } from "@/lib/react-query/query-keys";
import { membersApi } from "@/lib/api-client/members.api";
import { plansApi } from "@/lib/api-client/plans.api";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import CreateMembershipPage from "./create-page";

interface PageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function NewMembershipPage({ params, searchParams }: PageProps) {
    const { slug } = await params;
    const resolvedSearchParams = await searchParams;
    const memberId = typeof resolvedSearchParams.memberId === 'string' ? resolvedSearchParams.memberId : undefined;

    const queryClient = getQueryClient()

    if (memberId) {
        await queryClient.prefetchQuery({
            queryKey: memberKeys.detail(memberId),
            queryFn: () => membersApi.getById(memberId),
        });
    }

    await queryClient.prefetchQuery({
        queryKey: planKeys.lists(),
        queryFn: () => plansApi.getAll({
            page: 1,
            limit: 100,
        })
    })

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <CreateMembershipPage slug={slug} />
        </HydrationBoundary>
    );
}
