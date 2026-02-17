import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import MembersViewPage from "./components/view-page";
import { membersApi } from "@/lib/api-client/members.api";
import { memberKeys } from "@/lib/react-query/query-keys";
import { getQueryClient } from "@/lib/react-query/client-config";
import { membersSearchParamsCache } from "@/lib/nuqs/search-params/members";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MembersPage({ searchParams }: PageProps) {
  const queryClient = getQueryClient();

  const { page, limit, search, sort, status } = await membersSearchParamsCache.parse(searchParams);

  const filters = {
    page, limit, filters: { search, sort, status }
  }

  await queryClient.prefetchQuery({
    queryKey: memberKeys.list(filters),
    queryFn: () => membersApi.getAll(filters),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MembersViewPage />
    </HydrationBoundary>
  );
}
