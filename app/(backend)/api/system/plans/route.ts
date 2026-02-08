import { createContext } from "@/server/lib/api-handler";

export const GET = createContext(
    (c) => c.getSystemPlansController
);

export const POST = createContext(
    (container) => container.createSystemPlanController,
    async (req) => await req.json()
);
