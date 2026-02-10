import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getContainer } from "@/server/di/container";
import MemberForm from "../components/members-form";
import { makeQueryClient } from "@/lib/react-query/client-config";
import { memberKeys } from "@/lib/react-query/query-keys";
import { MembersService } from "@/lib/services/members.service";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import MembersViewPage from "../components/view-page";

export const metadata: Metadata = {
  title: "Detalle de Miembro",
};

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function MemberPage({
  params,
}: PageProps) {
  const { id } = await params;

  const queryClient = makeQueryClient()

  await queryClient.prefetchQuery({
    queryKey: memberKeys.detail(id),
    queryFn: () => MembersService.getById(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MemberForm />
    </HydrationBoundary>
  );
}
