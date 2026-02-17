import { Metadata } from "next";
import { getQueryClient } from "@/lib/react-query/client-config";

import { membershipKeys } from "@/lib/react-query/query-keys";
import { membershipsApi } from "@/lib/api-client/memberships.api";
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
        queryFn: () => membershipsApi.getById(id),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <MembershipDetailViewPage />
        </HydrationBoundary>
    );
}
