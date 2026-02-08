"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSystemStats } from "@/hooks/system/use-system";
import { Users, Building2, CreditCard, Activity } from "lucide-react";

export function SystemDashboardView() {
    const { data: stats, isLoading, error } = useSystemStats();

    if (isLoading) {
        return <div className="p-4">Cargando estadísticas...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">Error al cargar estadísticas</div>;
    }

    if (!stats) return null;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">System Overview (GOD Mode)</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Gimnasios</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalOrgs}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Usuarios Globales</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Suscripciones Activas</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeSubs}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">MRR (Est.)</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(stats.mrr)}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
