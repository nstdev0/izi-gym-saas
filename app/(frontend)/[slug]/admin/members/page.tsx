import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import MembersViewPage from "./components/view-page";
import { MembersService } from "@/lib/services/members.service";
import { memberKeys } from "@/lib/react-query/query-keys";
import { makeQueryClient } from "@/lib/react-query/client-config";
import { membersSearchParamsCache } from "@/lib/nuqs/search-params/members";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MembersPage({ searchParams }: PageProps) {
  const queryClient = makeQueryClient();

  const filters = await membersSearchParamsCache.parse(searchParams);

  await queryClient.prefetchQuery({
    queryKey: memberKeys.list(filters),
    queryFn: () => MembersService.getAll(filters),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MembersViewPage />
    </HydrationBoundary>
  );
}
