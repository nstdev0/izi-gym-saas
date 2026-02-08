import { createContext } from "@/server/lib/api-handler";

export const GET = createContext(c => c.getAllOrganizationsSystemController, (req) => {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const sort = searchParams.get("sort") || "";

    return {
        page,
        limit,
        filters: {
            search,
            status,
            sort
        }
    };

})