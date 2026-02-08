import { createContext } from "@/server/lib/api-handler";

export const GET = createContext(
    (c) => c.getSystemConfigController
);

export const PUT = createContext(
    (c) => c.updateSystemConfigController,
    async (req) => await req.json()
);