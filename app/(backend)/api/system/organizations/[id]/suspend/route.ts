import { createContext } from "@/server/lib/api-handler";

export const POST = createContext(c => c.suspendOrganizationController, async (req, params) => {
    const { suspend } = await req.json();
    const paramsData = (await params) || {};
    const id = paramsData.id as string;

    return {
        organizationId: id,
        suspend
    };
})