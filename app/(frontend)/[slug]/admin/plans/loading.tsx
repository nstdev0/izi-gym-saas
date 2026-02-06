import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export default function Loading() {
    return (
        <DashboardLayout breadcrumbs={[{ label: "Admin" }, { label: "Planes" }]}>
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-muted rounded w-1/4"></div>
                <div className="h-64 bg-muted rounded"></div>
            </div>
        </DashboardLayout>
    );
}
