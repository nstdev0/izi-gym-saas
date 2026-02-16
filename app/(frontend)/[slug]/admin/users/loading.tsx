import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTableSkeleton } from "@/components/ui/skeletons/data-table-skeleton";
import { StatCardSkeleton } from "@/components/ui/skeletons/stat-card-skeleton";

export default function Loading() {
    return (
        <DashboardLayout breadcrumbs={[{ label: "Admin" }, { label: "Usuarios" }]}>
            <div className="flex flex-col h-full space-y-6 pb-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-[180px]" />
                </div>

                {/* Table */}
                <DataTableSkeleton rowCount={10} columnCount={5} />
            </div>
        </DashboardLayout>
    );
}
