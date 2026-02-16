import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCardSkeleton } from "./stat-card-skeleton";
import { ChartSkeleton } from "./chart-skeleton";
import { ListSkeleton } from "./list-skeleton";

export default function DashboardSkeleton() {
    return (
        <DashboardLayout breadcrumbs={[{ label: "Admin" }, { label: "Panel" }]}>
            <div className="flex flex-col space-y-4 sm:space-y-6 pb-4">
                {/* Page Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <Skeleton className="h-9 w-[250px]" />
                </div>

                {/* Quick Actions */}
                <Skeleton className="h-32 w-full rounded-xl" />

                {/* KPI Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="lg:col-span-3">
                        <ChartSkeleton />
                    </div>
                    <div className="lg:col-span-1">
                        <ListSkeleton itemCount={5} />
                    </div>
                    <div className="lg:col-span-1">
                        <ListSkeleton itemCount={5} />
                    </div>
                    <div className="lg:col-span-1">
                        <ListSkeleton itemCount={5} />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
