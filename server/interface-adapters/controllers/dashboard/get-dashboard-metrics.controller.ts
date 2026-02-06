import { GetDashboardMetricsUseCase } from "@/server/application/use-cases/dashboard/get-dashboard-metrics.use-case";
import { NextResponse } from "next/server";

export class GetDashboardMetricsController {
    constructor(private getDashboardMetricsUseCase: GetDashboardMetricsUseCase) { }

    async handle(request: Request, organizationId: string) {
        try {
            const { searchParams } = new URL(request.url);
            const fromParam = searchParams.get("from");
            const toParam = searchParams.get("to");

            const from = fromParam ? new Date(fromParam) : undefined;
            const to = toParam ? new Date(toParam) : undefined;

            const metrics = await this.getDashboardMetricsUseCase.execute(organizationId, from, to);

            return NextResponse.json(metrics);
        } catch (error) {
            console.error("Error getting dashboard metrics:", error);
            return new NextResponse("Internal Server Error", { status: 500 });
        }
    }
}
