import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card } from "@/components/ui/card";

export default function Loading() {
    return (
        <DashboardLayout
            breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Usuarios" }]}
        >
            <div className="flex flex-col h-full space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-2">
                        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-64 bg-muted animate-pulse rounded" />
                    </div>
                    <div className="h-9 w-32 bg-muted animate-pulse rounded" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="p-3">
                            <div className="h-4 w-24 mb-2 bg-muted animate-pulse rounded" />
                            <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="h-9 w-full sm:w-[300px] bg-muted animate-pulse rounded" />
                    <div className="h-9 w-[180px] bg-muted animate-pulse rounded" />
                </div>

                {/* Table */}
                <Card className="flex-1 overflow-hidden p-4">
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                        </div>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex justify-between border-t pt-4">
                                <div className="h-10 w-full bg-muted animate-pulse rounded" />
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
