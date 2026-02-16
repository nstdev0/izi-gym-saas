import { createContext } from "@/server/lib/api-handler";

export const POST = createContext((container) => container.restoreMembershipController);
