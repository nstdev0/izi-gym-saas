import { getContainer } from "@/server/di/container";
import MembersViewPage from "./components/view-page";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MembersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = (params.search as string) || undefined;
  const sort = (params.sort as string) || undefined
  const page = Number(params.page) || 1;
  const limit = 10;

  const container = await getContainer();

  const paginatedMembers = await container.getAllMembersController.execute({
    page,
    limit,
    filters: { search: search, sort: sort },
  });

  return <MembersViewPage paginatedMembers={paginatedMembers} />;
}
