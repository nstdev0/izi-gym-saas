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
    Calendar as CalendarIcon,
    UserPlus,
    AlertTriangle,
    ArrowRight,
    Dumbbell,
    Loader2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { useEffect, useState } from "react";
import { DashboardMetrics } from "@/server/domain/entities/dashboard-metrics";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { DateRange } from "react-day-picker";
import { format, subDays, startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek, startOfYear, endOfYear, subYears } from "date-fns";
import { es } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

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

    // Date Range State
    const [date, setDate] = useState<DateRange | undefined>({
        from: startOfYear(new Date()),
        to: endOfYear(new Date()),
    });
    const [grouping, setGrouping] = useState<'day' | 'month' | 'year'>('month');

    useEffect(() => {
        async function fetchMetrics() {
            try {
                setLoading(true);
                const queryParams = new URLSearchParams();
                if (date?.from) queryParams.set("from", date.from.toISOString());
                if (date?.to) queryParams.set("to", date.to.toISOString());
                if (grouping) queryParams.set("grouping", grouping);

                const response = await fetch(`/api/dashboard?${queryParams.toString()}`);
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

        if (date?.from) {
            fetchMetrics();
        }
    }, [date, grouping]);

    const handlePresetSelect = (preset: string) => {
        const now = new Date();
        let newDate: DateRange | undefined;

        switch (preset) {
            case "today":
                newDate = { from: now, to: now };
                break;
            case "yesterday":
                const yesterday = subDays(now, 1);
                newDate = { from: yesterday, to: yesterday };
                break;
            case "thisWeek":
                newDate = { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfWeek(now, { weekStartsOn: 1 }) };
                break;
            case "lastWeek":
                const lastWeek = subDays(now, 7);
                newDate = { from: startOfWeek(lastWeek, { weekStartsOn: 1 }), to: endOfWeek(lastWeek, { weekStartsOn: 1 }) };
                break;
            case "last7days":
                newDate = { from: subDays(now, 6), to: now };
                break;
            case "thisMonth":
                newDate = { from: startOfMonth(now), to: endOfMonth(now) };
                break;
            case "lastMonth":
                const lastMonth = subMonths(now, 1);
                newDate = { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
                break;
        }

        if (newDate) {
            setDate(newDate);
        }
    };

    const handleGroupingChange = (value: 'day' | 'month' | 'year') => {
        setGrouping(value);
        const now = new Date();
        if (value === 'day') {
            setDate({ from: startOfMonth(now), to: endOfMonth(now) });
        } else if (value === 'month') {
            setDate({ from: startOfYear(now), to: endOfYear(now) });
        } else if (value === 'year') {
            setDate({ from: subYears(now, 9), to: endOfYear(now) });
        }
    };

    return (
        <DashboardLayout
            breadcrumbs={[{ label: "Admin" }, { label: "Dashboard" }]}
        >
            <div className="flex flex-col space-y-4 sm:space-y-6 overflow-auto pb-4 scrollbar-hide">
                <PageHeader
                    title="Dashboard"
                    description="Resumen general de tu gimnasio"
                    actions={
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    size="sm"
                                    className={cn(
                                        "w-auto justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date?.from ? (
                                        date.to ? (
                                            <>
                                                {format(date.from, "LLL dd, y", { locale: es })} -{" "}
                                                {format(date.to, "LLL dd, y", { locale: es })}
                                            </>
                                        ) : (
                                            format(date.from, "LLL dd, y", { locale: es })
                                        )
                                    ) : (
                                        <span>Seleccionar fechas</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <div className="flex flex-col sm:flex-row">
                                    <Calendar
                                        autoFocus
                                        mode="range"
                                        defaultMonth={date?.from}
                                        selected={date}
                                        onSelect={setDate}
                                        numberOfMonths={1}
                                    />
                                    <div className="p-3 border-t sm:border-t-0 sm:border-l space-y-1 min-w-[140px]">
                                        <div className="space-y-1">
                                            <Button variant="ghost" className="w-full justify-start text-xs font-normal" onClick={() => handlePresetSelect("today")}>
                                                Hoy
                                            </Button>
                                            <Button variant="ghost" className="w-full justify-start text-xs font-normal" onClick={() => handlePresetSelect("yesterday")}>
                                                Ayer
                                            </Button>
                                            <Button variant="ghost" className="w-full justify-start text-xs font-normal" onClick={() => handlePresetSelect("thisWeek")}>
                                                Esta semana
                                            </Button>
                                            <Button variant="ghost" className="w-full justify-start text-xs font-normal" onClick={() => handlePresetSelect("lastWeek")}>
                                                Semana pasada
                                            </Button>
                                            <Button variant="ghost" className="w-full justify-start text-xs font-normal" onClick={() => handlePresetSelect("last7days")}>
                                                Últimos 7 días
                                            </Button>
                                            <Button variant="ghost" className="w-full justify-start text-xs font-normal" onClick={() => handlePresetSelect("thisMonth")}>
                                                Este mes
                                            </Button>
                                            <Button variant="ghost" className="w-full justify-start text-xs font-normal" onClick={() => handlePresetSelect("lastMonth")}>
                                                Mes pasado
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    }
                />

                {/* Quick Actions - Row 1 */}
                <Card>
                    <CardContent className="px-4 sm:px-6 py-4">
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
                            <Link href={`/${slug}/admin/products`}>
                                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 hover:border-primary hover:text-primary transition-colors">
                                    <Dumbbell className="h-5 w-5" />
                                    <span className="text-xs sm:text-sm">Productos</span>
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* KPI Stats Grid - Row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                    <StatCard
                        title="Miembros Activos"
                        value={metrics?.activeMembers.value ?? 0}
                        change={metrics?.activeMembers.percentageChange ?? 0}
                        icon={Users}
                        isLoading={loading}
                    />
                    <StatCard
                        title="Ingresos"
                        value={metrics?.revenue.value.toLocaleString('es-ES', { style: 'currency', currency: metrics?.currency || 'PEN' }) ?? 0}
                        change={metrics?.revenue.percentageChange ?? 0}
                        icon={DollarSign}
                        isLoading={loading}
                    />
                    <StatCard
                        title="Por Vencer (7d)"
                        value={metrics?.expiringSoon ?? 0}
                        change={0}
                        icon={AlertTriangle}
                        isLoading={loading}
                    />
                </div>

                {/* Main Content Grid - Row 3 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Revenue Chart - Full width visually (or col-span-3) */}
                    <Card className="lg:col-span-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base sm:text-lg font-semibold">Ingresos</CardTitle>
                            <Select value={grouping} onValueChange={(v: any) => handleGroupingChange(v)}>
                                <SelectTrigger className="w-[120px] h-8 text-xs">
                                    <SelectValue placeholder="Agrupar por" />
                                </SelectTrigger>
                                <SelectContent align="end">
                                    <SelectItem value="day">Por Día</SelectItem>
                                    <SelectItem value="month">Por Mes</SelectItem>
                                    <SelectItem value="year">Por Año</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardHeader>
                        <CardContent className="pl-2">
                            {loading ? (
                                <div className="h-[300px] flex items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : (
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={metrics?.revenueOverTime || []}>
                                            <XAxis
                                                dataKey="month"
                                                stroke="#888888"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                stroke="#888888"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                                tickFormatter={(value) => value.toLocaleString('es-ES', { style: 'currency', currency: metrics?.currency || 'PEN', maximumFractionDigits: 0 })}
                                            />
                                            <Tooltip
                                                cursor={{ fill: "transparent" }}
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        return (
                                                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                                            Ingresos
                                                                        </span>
                                                                        <span className="font-bold text-muted-foreground">
                                                                            {payload[0]?.value?.toLocaleString('es-ES', { style: 'currency', currency: metrics?.currency || 'PEN' })}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Bar
                                                dataKey="revenue"
                                                fill="currentColor"
                                                radius={[4, 4, 0, 0]}
                                                className="fill-primary"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Popular Plans */}
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
                                    {metrics?.salesByPlan.sort((a, b) => b.count - a.count).map((plan) => {
                                        const totalCount = metrics.salesByPlan.reduce((acc, p) => acc + p.count, 0);
                                        const percentage = totalCount > 0 ? (plan.count / totalCount) * 100 : 0;

                                        return (
                                            <div key={plan.planName} className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-medium text-foreground">{plan.planName}</span>
                                                    <span className="text-muted-foreground">
                                                        {plan.count} ventas
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
                                    {metrics?.salesByPlan.length === 0 && (
                                        <p className="text-sm text-muted-foreground text-center py-8">
                                            No hay datos de planes.
                                        </p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Upcoming Expirations */}
                    <Card className="lg:col-span-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                                Próximos Vencimientos
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : (
                                <div className="space-y-3 sm:space-y-4">
                                    {metrics?.upcomingExpirations?.map((member) => (
                                        <div
                                            key={member.id}
                                            className="flex items-center justify-between gap-3 p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Avatar className="h-8 w-8 shrink-0">
                                                    <AvatarImage src={member.avatar || undefined} alt={member.name} />
                                                    <AvatarFallback className="bg-orange-500/10 text-orange-500 text-xs">
                                                        {member.name.split(" ").map((n) => n[0]).join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-foreground truncate">
                                                        {member.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        Vence en {member.daysUntil} días
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Badge variant="outline" className="text-xs border-orange-200 text-orange-700 bg-orange-50">
                                                    {format(new Date(member.endDate), "dd MMM", { locale: es })}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                    {(!metrics?.upcomingExpirations || metrics.upcomingExpirations.length === 0) && (
                                        <p className="text-sm text-muted-foreground text-center py-8">
                                            No hay vencimientos próximos.
                                        </p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Members */}
                    <Card className="lg:col-span-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <CardTitle className="text-base sm:text-lg font-semibold">
                                Miembros Recientes
                            </CardTitle>
                            <Link href={`/${slug}/admin/members`}>
                                <Button variant="ghost" size="sm" className="gap-1 text-primary">
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
                </div>
            </div>
        </DashboardLayout>
    );
}
