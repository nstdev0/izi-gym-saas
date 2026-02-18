"use client";

import { useSearchParams } from "next/navigation";
import { usePlansList } from "@/hooks/plans/use-plans";
import { useMemberDetail } from "@/hooks/members/use-members";
import MembershipForm from "../components/memberships-form";
import { Skeleton } from "@/components/ui/skeleton";

interface CreateMembershipPageProps {
    slug: string;
}

export default function CreateMembershipPage({ slug }: CreateMembershipPageProps) {
    const searchParams = useSearchParams();
    const memberId = searchParams.get("memberId") || "";

    const { data: plans, isLoading: isLoadingPlans } = usePlansList({
        page: 1,
        limit: 100,
    });

    // Solo buscamos el miembro si existe el ID en la URL
    const { data: memberDetail, isLoading: isLoadingMember } = useMemberDetail(memberId);

    if (isLoadingPlans || (memberId && isLoadingMember)) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <Skeleton className="h-[600px] w-full" />
            </div>
        );
    }

    return (
        <MembershipForm
            redirectUrl={`/${slug}/admin/memberships`}
            plans={plans?.records || []}
            // Si memberId existe, pasamos el miembro encontrado (o undefined si está cargando/no existe)
            member={memberId ? memberDetail : undefined}
        />
    );
}
