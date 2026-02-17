import { getQueryClient } from "@/lib/react-query/client-config";
import { memberKeys, planKeys } from "@/lib/react-query/query-keys";
import { membersApi } from "@/lib/api-client/members.api";
import { plansApi } from "@/lib/api-client/plans.api";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import MembershipDetailViewPage from "../[id]/view-page";

interface PageProps {
    params: Promise<{ slug: string, memberId?: string }>;
}

export default async function NewMembershipPage({ params }: PageProps) {
    const { slug, memberId } = await params;

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
            <MembershipDetailViewPage />
        </HydrationBoundary>
    );
}
