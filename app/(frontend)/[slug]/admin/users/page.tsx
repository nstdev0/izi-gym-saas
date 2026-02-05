import { getContainer } from "@/server/di/container";
import UsersViewPage from "./components/view-page";
import { Role } from "@/generated/prisma/enums";

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
    params: Promise<{ slug: string }>;
}

export default async function UsersPage({ searchParams, params }: PageProps) {
    const sp = await searchParams;
    const p = await params; // Slug might be needed for layout but layout handles it via context usually or link

    const query = (sp.query as string) || "";
    const page = Number(sp.page) || 1;
    const limit = 10;
    const role = (sp.role as Role) || undefined;

    // Note: isActive filter logic might need refinement if searchParams only passes strings
    // Usually string "true" -> true. But here we might want to default to showing all?
    // Or filter explicit state? The endpoint logic was `isActive: searchParams.get("isActive") === "true"`.
    // If undefined/null, it probably shouldn't filter.
    // We'll leave isActive filter out of the main list page URL for now unless specifically requested, or defaults to all.

    const container = await getContainer();

    const paginatedUsers = await container.getAllUsersController.execute({
        page,
        limit,
        filters: {
            search: query,
            role: role,
            // isActive: undefined // Not filtering by default
        },
    });

    return <UsersViewPage paginatedUsers={paginatedUsers} />;
}
