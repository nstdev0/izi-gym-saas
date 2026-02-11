"use client"

import { useMemberDetail } from "@/hooks/members/use-members";
import { useParams } from "next/navigation";
import MemberForm from "../components/members-form";
import MemberFormSkeleton from "../components/member-form-skeleton";

export default function MemberViewPage() {
    const params = useParams();
    const slug = params.slug as string;
    const id = params.id as string;

    const { data: memberDetail, isLoading } = useMemberDetail(id);

    if (isLoading || !memberDetail) {
        return <MemberFormSkeleton />
    }

    return (
        <MemberForm isEdit={true} initialData={memberDetail} redirectUrl={`/${slug}/admin/members`} />
    );
}