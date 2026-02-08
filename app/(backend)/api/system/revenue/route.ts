import { createContext } from "@/server/lib/api-handler";

export const GET = createContext(
    (c) => c.getRevenueStatsController
);
