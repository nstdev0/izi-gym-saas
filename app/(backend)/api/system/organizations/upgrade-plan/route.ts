import { createContext } from "@/server/lib/api-handler";

export const POST = createContext((c) => c.upgradeOrganizationPlanController,
    async (req) => {
        const body = await req.json();
        return body
    }
)