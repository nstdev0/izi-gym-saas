"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Users,
    TrendingUp,
    TrendingDown,
    CreditCard,
    DollarSign,
    Calendar,
    UserPlus,
    RefreshCw,
    AlertTriangle,
    ArrowRight,
    Dumbbell,
    Activity,
    Loader2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { useEffect, useState } from "react";
import { DashboardMetrics } from "@/server/domain/entities/dashboard-metrics";

// ==============================================
// COMPONENTS
// ==============================================

interface StatCardProps {
    title: string;
    value: string | number;
    change: number;
    icon: React.ElementType;
    prefix?: string;
    isLoading?: boolean;
}

function StatCard({ title, value, change, icon: Icon, prefix = "", isLoading }: StatCardProps) {
    const isPositive = change >= 0;

    return (
        <Card className="relative overflow-hidden">
            <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                            {title}
                        </p>
                        {isLoading ? (
                            <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                        ) : (
                            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                                {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
                            </p>
                        )}
                        <div className="flex items-center gap-1">
                            {isLoading ? (
                                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                            ) : (
                                <>
                                    {isPositive ? (
                                        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                                    ) : (
                                        <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                                    )}
                                    <span
                                        className={`text-xs sm:text-sm font-medium ${isPositive ? "text-green-500" : "text-red-500"
                                            }`}
                                    >
                                        {isPositive ? "+" : ""}{change.toFixed(1)}%
                                    </span>
                                    <span className="text-xs text-muted-foreground">vs periodo anterior</span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="rounded-full bg-primary/10 p-2 sm:p-3">
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function getPlanBadgeVariant(plan: string): "default" | "secondary" | "destructive" | "outline" {
    switch (plan.toLowerCase()) {
        case "premium":
            return "default";
        case "elite":
            return "destructive";
        default:
            return "secondary";
    }
}

// ==============================================
// MAIN DASHBOARD PAGE
// ==============================================

export default function DashboardPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMetrics() {
            try {
                const response = await fetch("/api/dashboard");
                if (response.ok) {
                    const data = await response.json();
                    setMetrics(data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard metrics", error);
            } finally {
                setLoading(false);
            }
        }
        fetchMetrics();
    }, []);

    // Helper to calc total members (active + expired roughly or just total stats?) 
    // The metric says "totalActiveMembers" in the interface. 
    // Use Case implementation of Domain Entity: 
    // activeMembers: MetricWithTrend (Current Active Count)
    // newMemberships: MetricWithTrend (New Sales)
    // We can map these to the cards.

    return (
        <DashboardLayout
            breadcrumbs={[{ label: "Admin" }, { label: "Dashboard" }]}
        >
            <div className="flex flex-col space-y-4 sm:space-y-6 overflow-auto pb-4 scrollbar-hide">
                <PageHeader
                    title="Dashboard"
                    description="Resumen general de tu gimnasio"
                    actions={
                        <Button variant="outline" size="sm" className="gap-2">
                            <Calendar className="h-4 w-4" />
                            <span className="hidden sm:inline">Este Mes</span>
                            <span className="sm:hidden">Mes</span>
                        </Button>
                    }
                />

                {/* KPI Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <StatCard
                        title="Miembros Activos"
                        value={metrics?.activeMembers.value ?? 0}
                        change={metrics?.activeMembers.percentageChange ?? 0}
                        icon={Users}
                        isLoading={loading}
                    />
                    <StatCard
                        title="Nuevas Membresías"
                        value={metrics?.newMemberships.value ?? 0}
                        change={metrics?.newMemberships.percentageChange ?? 0}
                        icon={Activity}
                        isLoading={loading}
                    />
                    <StatCard
                        title="Ingresos"
                        value={metrics?.revenue.value ?? 0}
                        change={metrics?.revenue.percentageChange ?? 0}
                        icon={DollarSign}
                        prefix="$"
                        isLoading={loading}
                    />
                    <StatCard
                        title="Por Vencer (7d)"
                        value={metrics?.expiringMemberships.length ?? 0}
                        change={0} // No trend for this yet
                        icon={AlertTriangle}
                        isLoading={loading}
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Recent Members - Takes 2 columns on large screens */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <CardTitle className="text-base sm:text-lg font-semibold">
                                Miembros Recientes
                            </CardTitle>
                            <Link href={`/${slug}/admin/members`}>
                                <Button variant="ghost" size="sm" className="gap-1 text-primary">
                                    Ver todos
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : (
                                <div className="space-y-3 sm:space-y-4">
                                    {metrics?.recentActivity.map((member) => (
                                        <div
                                            key={member.id}
                                            className="flex items-center justify-between gap-3 p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Avatar className="h-9 w-9 sm:h-10 sm:w-10 shrink-0">
                                                    <AvatarImage src={member.avatar || undefined} alt={member.name} />
                                                    <AvatarFallback className="bg-primary/10 text-primary text-xs sm:text-sm">
                                                        {member.name.split(" ").map((n) => n[0]).join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-foreground truncate">
                                                        {member.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {member.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Badge variant={getPlanBadgeVariant(member.planName || "")} className="hidden sm:flex">
                                                    {member.planName}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {new Date(member.joinedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {metrics?.recentActivity.length === 0 && (
                                        <p className="text-sm text-muted-foreground text-center py-8">
                                            No hay actividad reciente.
                                        </p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Expiring Soon */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                Por Vencer
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {metrics?.expiringMemberships.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <Avatar className="h-8 w-8 shrink-0">
                                                    <AvatarImage src={item.avatar || undefined} alt={item.memberName} />
                                                    <AvatarFallback className="bg-amber-500/10 text-amber-600 text-xs">
                                                        {item.memberName.split(" ").map((n) => n[0]).join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-foreground truncate">
                                                        {item.memberName}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.planName}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="shrink-0 text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30">
                                                {item.daysUntilExpiration} días
                                            </Badge>
                                        </div>
                                    ))}
                                    {metrics?.expiringMemberships.length === 0 && (
                                        <p className="text-sm text-muted-foreground text-center py-8">
                                            Ninguna membresía por vencer pronto.
                                        </p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Second Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Top Plans */}
                    <Card className="lg:col-span-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                                <Dumbbell className="h-4 w-4 text-primary" />
                                Planes Populares
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {metrics?.membersByPlan.map((plan) => {
                                        // Calculate percentage based on total count of all plans shown? or total in metric?
                                        // Let's sum counts from the list 
                                        const totalCount = metrics.membersByPlan.reduce((acc, p) => acc + p.count, 0);
                                        const percentage = totalCount > 0 ? (plan.count / totalCount) * 100 : 0;

                                        return (
                                            <div key={plan.planName} className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-medium text-foreground">{plan.planName}</span>
                                                    <span className="text-muted-foreground">
                                                        {plan.count} miembros
                                                    </span>
                                                </div>
                                                <div className="h-2 rounded-full bg-muted overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full bg-primary transition-all duration-500`}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                    {metrics?.membersByPlan.length === 0 && (
                                        <p className="text-sm text-muted-foreground text-center py-8">
                                            No hay datos de planes.
                                        </p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions - Always useful */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base sm:text-lg font-semibold">
                                Acciones Rápidas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <Link href={`/${slug}/admin/members/new`}>
                                    <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 hover:border-primary hover:text-primary transition-colors">
                                        <UserPlus className="h-5 w-5" />
                                        <span className="text-xs sm:text-sm">Nuevo Miembro</span>
                                    </Button>
                                </Link>
                                <Link href={`/${slug}/admin/members`}>
                                    <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 hover:border-primary hover:text-primary transition-colors">
                                        <Users className="h-5 w-5" />
                                        <span className="text-xs sm:text-sm">Ver Miembros</span>
                                    </Button>
                                </Link>
                                <Link href={`/${slug}/admin/memberships`}>
                                    <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 hover:border-primary hover:text-primary transition-colors">
                                        <CreditCard className="h-5 w-5" />
                                        <span className="text-xs sm:text-sm">Membresías</span>
                                    </Button>
                                </Link>
                                <Link href={`/${slug}/admin/users`}>
                                    <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 hover:border-primary hover:text-primary transition-colors">
                                        <Dumbbell className="h-5 w-5" />
                                        <span className="text-xs sm:text-sm">Usuarios</span>
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
