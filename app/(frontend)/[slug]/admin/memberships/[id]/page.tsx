import { Metadata } from "next";
import { getQueryClient } from "@/lib/react-query/client-config";

import { membershipKeys } from "@/lib/react-query/query-keys";
import { MembershipsService } from "@/lib/services/memberships.service";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import MembershipDetailViewPage from "./view-page";

export const metadata: Metadata = {
    title: "Detalle de Membresía",
    description: "Ver información de la membresía",
};

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MembershipsDetail({ params, searchParams }: PageProps) {
    const queryClient = getQueryClient();

    const { id } = await params; // params is a Promise now

    await queryClient.prefetchQuery({
        queryKey: membershipKeys.detail(id),
        queryFn: () => MembershipsService.getById(id),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <MembershipDetailViewPage />
        </HydrationBoundary>
    );
}
