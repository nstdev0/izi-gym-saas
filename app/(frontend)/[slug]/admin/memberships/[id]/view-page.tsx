"use client"

import { useParams } from "next/navigation";
import { useMembershipDetail } from "@/hooks/memberships/use-memberships";
import MembershipForm from "../components/memberships-form";
import { usePlansList } from "@/hooks/plans/use-plans";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemberDetail } from "@/hooks/members/use-members";

export default function MembershipDetailViewPage() {
    const params = useParams();
    const slug = params.slug as string;
    const id = params.id as string;

    const { data: membershipDetail, isLoading } = useMembershipDetail(id);
    const { data: plans } = usePlansList({
        page: 1,
        limit: 100,
    });
    const { data: memberDetail } = useMemberDetail(membershipDetail?.memberId || "");

    if (isLoading || !memberDetail) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <Skeleton className="h-[600px] w-full" />
            </div>
        )
    }

    return (
        <MembershipForm
            initialData={membershipDetail}
            redirectUrl={`/${slug}/admin/memberships`}
            plans={plans?.records || []}
            member={memberDetail}
        />
    );
}
