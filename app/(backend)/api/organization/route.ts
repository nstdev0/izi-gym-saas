import { createContext } from "@/server/lib/api-handler";

export const GET = createContext<void>(
    (container) => container.getOrganizationController
);
