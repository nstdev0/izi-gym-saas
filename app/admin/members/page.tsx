import { getContainer } from "@/server/di/container";
import MembersViewPage from "./view-page";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MembersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = (params.query as string) || "";
  const page = Number(params.page) || 1;
  const limit = 10;

  const paginatedMembers = await getContainer().getAllMembersController.execute(
    {
      page,
      limit,
      filters: { search: query },
    },
  );

  return <MembersViewPage paginatedMembers={paginatedMembers} />;
}
