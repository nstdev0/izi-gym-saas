import { GetDashboardMetricsInput } from "@/server/domain/types/dashboard";
import { createContext } from "@/server/lib/api-handler";

export const GET = createContext<GetDashboardMetricsInput>(
    (container) => container.getDashboardMetricsController,
    (req) => {
        const { searchParams } = new URL(req.url);
        const fromParam = searchParams.get("from");
        const toParam = searchParams.get("to");
        const groupingParam = searchParams.get("grouping");

        return {
            from: fromParam ? new Date(fromParam) : undefined,
            to: toParam ? new Date(toParam) : undefined,
            grouping: (groupingParam === 'day' || groupingParam === 'month' || groupingParam === 'year') ? groupingParam : undefined
        };
    }
);
