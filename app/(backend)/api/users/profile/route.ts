import { createContext } from "@/server/lib/api-handler";

export const GET = createContext((c) => c.getUserProfileController);

export const PATCH = createContext((c) => c.updateUserProfileController, async (req) => {
    const body = await req.json();
    return body
});
