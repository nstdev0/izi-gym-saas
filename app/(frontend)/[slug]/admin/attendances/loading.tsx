import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { DataTableSkeleton } from "@/components/ui/skeletons/data-table-skeleton";

export default function Loading() {
    return (
        <DashboardLayout breadcrumbs={[{ label: "Admin" }, { label: "Asistencias" }]}>
            <div className="space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-56" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Skeleton className="h-24 rounded-xl" />
                    <Skeleton className="h-24 rounded-xl" />
                    <Skeleton className="h-24 rounded-xl" />
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-[180px]" />
                </div>

                {/* Table */}
                <Card>
                    <DataTableSkeleton rowCount={10} columnCount={4} />
                </Card>
            </div>
        </DashboardLayout>
    );
}
