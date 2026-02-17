import { createContext } from "@/server/lib/api-handler";

export const PATCH = createContext((c) => c.updateUserController, async (req) => {
    const body = await req.json();
    return body
});
