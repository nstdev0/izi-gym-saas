
import { createContext } from "@/server/lib/api-handler";

export const PUT = createContext(
    (c) => c.updateSystemPlanController,
    async (req) => await req.json()
);
