import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
    return (
        <DashboardLayout breadcrumbs={[{ label: "Admin" }, { label: "Configuración" }]}>
            <div className="flex flex-col space-y-6">
                {/* Header */}
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-96" />
                </div>

                <div className="container mx-auto max-w-6xl py-6 space-y-6">
                    <div className="space-y-6">
                        {/* Tabs List */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {[...Array(8)].map((_, i) => (
                                <Skeleton key={i} className="h-9 w-24 rounded-full" />
                            ))}
                        </div>

                        {/* Tab Content (Card) */}
                        <Card>
                            <CardHeader className="space-y-2">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-4 w-72" />
                            </CardHeader>
                            <CardContent className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Save Button */}
                        <div className="flex justify-end">
                            <Skeleton className="h-10 w-32" />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
