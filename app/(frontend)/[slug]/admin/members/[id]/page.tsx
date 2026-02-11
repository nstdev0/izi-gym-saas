import { Metadata } from "next";
import { makeQueryClient } from "@/lib/react-query/client-config";
import { memberKeys } from "@/lib/react-query/query-keys";
import { MembersService } from "@/lib/services/members.service";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import MemberViewPage from "./view-page";

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
      <MemberViewPage />
    </HydrationBoundary>
  );
}
