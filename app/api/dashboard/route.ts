import { getContainer } from "@/server/di/container";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { orgId } = await auth();

    if (!orgId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const container = await getContainer();
    const controller = container.getDashboardMetricsController;

    return await controller.handle(request, orgId);
}
