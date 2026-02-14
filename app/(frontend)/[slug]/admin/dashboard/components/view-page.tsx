"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Users,
    CreditCard,
    DollarSign,
    Calendar as CalendarIcon,
    UserPlus,
    AlertTriangle,
    ArrowRight,
    Dumbbell,
    Loader2,
    UserCheck,
    TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { DateRange } from "react-day-picker";
import { format, subDays, startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek, subYears, differenceInDays, startOfYear, endOfYear, setMonth } from "date-fns";
import { es } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useDashboardMetrics } from "@/hooks/dashboard/use-dashboard";
import StatCard from "./stat-card";
import getPlanBadgeVariant from "../utils/get-plan-badge-variant";
import { makeQueryClient } from "@/lib/react-query/client-config";
import { historicStartDateKeys } from "@/lib/react-query/query-keys";
import { AttendanceModal } from "./attendance-modal";
import { DashboardService } from "@/lib/services/dashboard.service";

export default function DashboardViewPage() {
    const queryClient = makeQueryClient()

    const params = useParams();
    const slug = params.slug as string;

    // Date Range State
    const [date, setDate] = useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
    });
    const [grouping, setGrouping] = useState<'day' | 'month' | 'year'>('day');

    // Fetch Metrics using Hook
    const { data: metrics, isLoading } = useDashboardMetrics({
        from: date?.from?.toISOString(),
        to: date?.to?.toISOString(),
        grouping,
    });

    const loading = isLoading;
    const [selectedPreset, setSelectedPreset] = useState<string | undefined>("thisMonth")

    const getAvailableGroupings = (from: Date, to: Date) => {
        const days = differenceInDays(to, from);
        const options: ('day' | 'month' | 'year')[] = ['day'];
        if (days >= 60) options.push('month');
        if (days >= 365) options.push('year');
        return options;
    };

    const handlePresetSelect = async (preset: string) => {
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
            case "thisSemester":
                // Obtenemos el mes actual (0-11)
                const currentMonth = now.getMonth();

                if (currentMonth < 6) {
                    // Estamos en el primer semestre (Ene - Jun)
                    newDate = {
                        from: startOfYear(now),
                        to: endOfMonth(setMonth(now, 5)) // Junio es el mes 5
                    };
                } else {
                    // Estamos en el segundo semestre (Jul - Dic)
                    newDate = {
                        from: startOfMonth(setMonth(now, 6)), // Julio es el mes 6
                        to: endOfYear(now)
                    };
                }
                setGrouping("month")
                break;

            case "lastSemester":
                const currentMonthLast = now.getMonth();

                if (currentMonthLast < 6) {
                    // Si estamos en el S1 (Ene-Jun), el anterior fue el S2 del AÑO PASADO (Jul-Dic)
                    const lastYear = subYears(now, 1);
                    newDate = {
                        from: startOfMonth(setMonth(lastYear, 6)), // Julio del año pasado
                        to: endOfYear(lastYear) // Diciembre del año pasado
                    };
                } else {
                    // Si estamos en el S2 (Jul-Dic), el anterior fue el S1 de ESTE AÑO (Ene-Jun)
                    newDate = {
                        from: startOfYear(now),
                        to: endOfMonth(setMonth(now, 5)) // Junio de este año
                    };
                }
                setGrouping("month")
                break;
            case "allTime":
                try {
                    const historicDate = await queryClient.ensureQueryData({
                        queryKey: historicStartDateKeys.historicStartDate(),
                        queryFn: () => DashboardService.getHistoricStartDate(),
                        staleTime: Infinity,
                    });

                    setGrouping("month")

                    if (historicDate) {
                        newDate = { from: new Date(historicDate), to: now };
                    } else {
                        newDate = { from: subYears(now, 5), to: now };
                    }
                } catch (error) {
                    console.error("Error fetching historic date", error);
                    newDate = { from: subYears(now, 5), to: now };
                }
                break;
        }

        if (newDate && newDate.from && newDate.to) {
            setDate(newDate);
            setSelectedPreset(preset);

            const available = getAvailableGroupings(newDate.from, newDate.to);
            if (!available.includes(grouping)) {
                setGrouping('day');
            }
        }
    };

    const handleGroupingChange = (value: 'day' | 'month' | 'year') => {
        setGrouping(value);
    };

    return (
        <DashboardLayout
            breadcrumbs={[{ label: "Admin" }, { label: "Panel" }]}
        >
            <div className="flex flex-col space-y-4 sm:space-y-6 pb-4">
                <PageHeader
                    title={`Bienvenido al panel de ${slug} 👋`}
                    description={`Métricas generales del gimnasio`}
                    actions={
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    size="sm"
                                    className={cn(
                                        "w-auto justify-start text-left font-normal shadow-sm hover:bg-muted/50 transition-all",
                                        "fixed top-16 sm:top-30 right-6 z-50 shadow-2xl bg-background/95 backdrop-blur-sm border-primary/20",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                                    {date?.from ? (
                                        date.to ? (
                                            <span className="font-medium text-foreground">
                                                {format(date.from, "LLL dd, y", { locale: es })} -{" "}
                                                {format(date.to, "LLL dd, y", { locale: es })}
                                            </span>
                                        ) : (
                                            format(date.from, "LLL dd, y", { locale: es })
                                        )
                                    ) : (
                                        <span>Seleccionar fechas</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[250px] sm:w-[400px] p-0" align="end">
                                <div className="flex flex-col sm:flex-row">
                                    <Calendar
                                        autoFocus
                                        mode="range"
                                        defaultMonth={date?.from}
                                        selected={date}
                                        numberOfMonths={1}
                                        onSelect={(range) => {
                                            setDate(range);
                                            setSelectedPreset(undefined);
                                            if (range?.from && range?.to) {
                                                const available = getAvailableGroupings(range.from, range.to);
                                                if (!available.includes(grouping)) {
                                                    setGrouping('day');
                                                }
                                            }
                                        }}
                                    />
                                    <div className="p-3 border-t sm:border-t-0 sm:border-l space-y-1 min-w-[140px] bg-muted/20">
                                        <div id="date-presets" className="space-y-1">
                                            <Button variant={selectedPreset === "today" ? "secondary" : "ghost"} className={cn("w-full justify-start text-xs font-normal", selectedPreset === "today" && "font-semibold")} onClick={() => handlePresetSelect("today")}>
                                                Hoy
                                            </Button>
                                            <Button variant={selectedPreset === "yesterday" ? "secondary" : "ghost"} className={cn("w-full justify-start text-xs font-normal", selectedPreset === "yesterday" && "font-semibold")} onClick={() => handlePresetSelect("yesterday")}>
                                                Ayer
                                            </Button>
                                            <Button variant={selectedPreset === "thisWeek" ? "secondary" : "ghost"} className={cn("w-full justify-start text-xs font-normal", selectedPreset === "thisWeek" && "font-semibold")} onClick={() => handlePresetSelect("thisWeek")}>
                                                Esta semana
                                            </Button>
                                            <Button variant={selectedPreset === "lastWeek" ? "secondary" : "ghost"} className={cn("w-full justify-start text-xs font-normal", selectedPreset === "lastWeek" && "font-semibold")} onClick={() => handlePresetSelect("lastWeek")}>
                                                Semana pasada
                                            </Button>
                                            <Button variant={selectedPreset === "last7days" ? "secondary" : "ghost"} className={cn("w-full justify-start text-xs font-normal", selectedPreset === "last7days" && "font-semibold")} onClick={() => handlePresetSelect("last7days")}>
                                                Últimos 7 días
                                            </Button>
                                            <Button variant={selectedPreset === "thisMonth" ? "secondary" : "ghost"} className={cn("w-full justify-start text-xs font-normal", selectedPreset === "thisMonth" && "font-semibold")} onClick={() => handlePresetSelect("thisMonth")}>
                                                Este mes
                                            </Button>
                                            <Button variant={selectedPreset === "lastMonth" ? "secondary" : "ghost"} className={cn("w-full justify-start text-xs font-normal", selectedPreset === "lastMonth" && "font-semibold")} onClick={() => handlePresetSelect("lastMonth")}>
                                                Mes pasado
                                            </Button>
                                            <Button variant={selectedPreset === "thisSemester" ? "secondary" : "ghost"} className={cn("w-full justify-start text-xs font-normal", selectedPreset === "thisSemester" && "font-semibold")} onClick={() => handlePresetSelect("thisSemester")}>
                                                Este semestre
                                            </Button>
                                            <Button variant={selectedPreset === "lastSemester" ? "secondary" : "ghost"} className={cn("w-full justify-start text-xs font-normal", selectedPreset === "lastSemester" && "font-semibold")} onClick={() => handlePresetSelect("lastSemester")}>
                                                Semestre pasado
                                            </Button>
                                            <Button variant={selectedPreset === "allTime" ? "secondary" : "ghost"} className={cn("w-full justify-start text-xs font-normal", selectedPreset === "allTime" && "font-semibold")} onClick={() => handlePresetSelect("allTime")}>
                                                Máximo histórico
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    }
                />

                {/* Quick Actions - Con profundidad y efecto hover */}
                <Card className="border-none shadow-md bg-gradient-to-br from-card to-muted/30">
                    <CardContent className="px-4 sm:px-6 py-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <Link href={`/${slug}/admin/members/new`}>
                                <Button variant="outline" className="w-full h-auto py-5 flex flex-col gap-2 border-dashed border-2 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all duration-300 shadow-sm hover:shadow-md">
                                    <div className="p-2 bg-primary/10 rounded-full">
                                        <UserPlus className="h-5 w-5 text-primary" />
                                    </div>
                                    <span className="text-xs sm:text-sm font-medium">Nuevo Miembro</span>
                                </Button>
                            </Link>
                            <AttendanceModal>
                                <Button variant="outline" className="w-full h-auto py-5 flex flex-col gap-2 border-dashed border-2 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all duration-300 shadow-sm hover:shadow-md">
                                    <div className="p-2 bg-primary/10 rounded-full">
                                        <UserCheck className="h-5 w-5 text-primary" />
                                    </div>
                                    <span className="text-xs sm:text-sm font-medium">Asistencia</span>
                                </Button>
                            </AttendanceModal>
                            <Link href={`/${slug}/admin/memberships`}>
                                <Button variant="outline" className="w-full h-auto py-5 flex flex-col gap-2 border-dashed border-2 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all duration-300 shadow-sm hover:shadow-md">
                                    <div className="p-2 bg-primary/10 rounded-full">
                                        <CreditCard className="h-5 w-5 text-primary" />
                                    </div>
                                    <span className="text-xs sm:text-sm font-medium">Venta rápida</span>
                                </Button>
                            </Link>
                            <Link href={`/${slug}/admin/products`}>
                                <Button variant="outline" className="w-full h-auto py-5 flex flex-col gap-2 border-dashed border-2 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all duration-300 shadow-sm hover:shadow-md">
                                    <div className="p-2 bg-primary/10 rounded-full">
                                        <Dumbbell className="h-5 w-5 text-primary" />
                                    </div>
                                    <span className="text-xs sm:text-sm font-medium">Renovar</span>
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* KPI Stats Grid */}
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

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

                    {/* 1. REVENUE CHART: Destacado con sombra más fuerte y un tono sutil */}
                    <Card className="lg:col-span-3 shadow-lg border-primary/10 bg-gradient-to-b from-card to-muted/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-border/50">
                            <div className="flex flex-col gap-1">
                                <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                                    <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-md">
                                        <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    Ingresos Totales
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">Evolución financiera en el tiempo seleccionado</p>
                            </div>
                            <Select value={grouping} onValueChange={(v) => handleGroupingChange(v as "day" | "month" | "year")}>
                                <SelectTrigger className="w-[130px] h-8 text-xs bg-background shadow-sm">
                                    <SelectValue placeholder="Agrupar por" />
                                </SelectTrigger>
                                <SelectContent align="end">
                                    <SelectItem value="day">Por Día</SelectItem>
                                    {date?.from && date?.to && differenceInDays(date.to, date.from) >= 60 && (
                                        <SelectItem value="month">Por Mes</SelectItem>
                                    )}
                                    {date?.from && date?.to && differenceInDays(date.to, date.from) >= 365 && (
                                        <SelectItem value="year">Por Año</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </CardHeader>
                        <CardContent className="pl-0 pt-6 pr-6">
                            {loading ? (
                                <div className="h-[300px] flex items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : (
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={metrics?.revenueOverTime || []} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                                            {/* Grilla sutil */}
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
                                            <XAxis
                                                dataKey="month"
                                                tickFormatter={(val) => {
                                                    const d = new Date(val);
                                                    if (grouping === 'day') return format(d, "dd MMM", { locale: es });
                                                    if (grouping === 'month') return format(d, "MMM yy", { locale: es });
                                                    return format(d, "yyyy");
                                                }}
                                                stroke="#888888"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                                dy={10}
                                            />
                                            <YAxis
                                                width={80}
                                                stroke="#888888"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                                tickFormatter={(value) => value.toLocaleString('es-ES', { style: 'currency', currency: metrics?.currency || 'PEN', maximumFractionDigits: 0 })}
                                            />
                                            <Tooltip
                                                cursor={{ fill: "var(--muted)", opacity: 0.2 }}
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        const data = payload[0].payload;
                                                        let dateLabel = "";
                                                        try {
                                                            const dateObj = new Date(data.month)
                                                            if (grouping === 'day') {
                                                                dateLabel = format(dateObj, "dd 'de' MMMM, yyyy", { locale: es });
                                                            } else if (grouping === 'month') {
                                                                dateLabel = format(dateObj, "MMMM yyyy", { locale: es });
                                                            } else if (grouping === 'year') {
                                                                dateLabel = format(dateObj, "yyyy", { locale: es });
                                                            }
                                                        } catch (e) {
                                                            dateLabel = data.month;
                                                        }

                                                        return (
                                                            <div className="rounded-xl border bg-background/95 backdrop-blur-md p-3 shadow-xl ring-1 ring-border/50">
                                                                <div className="flex flex-col gap-1">
                                                                    <div className="border-b pb-1 mb-1 border-border/50">
                                                                        <span className="text-xs font-semibold text-foreground capitalize">
                                                                            {dateLabel}
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-[0.65rem] uppercase text-muted-foreground font-medium tracking-wider">
                                                                        Ingresos
                                                                    </span>
                                                                    <span className="font-bold text-xl text-primary">
                                                                        {payload[0]?.value?.toLocaleString('es-ES', { style: 'currency', currency: metrics?.currency || 'PEN' })}
                                                                    </span>
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
                                                radius={[6, 6, 0, 0]}
                                                className="fill-primary/90 hover:fill-primary transition-all duration-300"
                                                barSize={grouping === 'day' ? undefined : 40}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* 2. POPULAR PLANS: Tinte sutil azulado/primary */}
                    <Card className="lg:col-span-1 shadow-md border-l-4 border-l-primary bg-gradient-to-br from-card to-primary/5">
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
                                <div className="space-y-5">
                                    {metrics?.salesByPlan.sort((a, b) => b.count - a.count).map((plan) => {
                                        const totalCount = metrics.salesByPlan.reduce((acc, p) => acc + p.count, 0);
                                        const percentage = totalCount > 0 ? (plan.count / totalCount) * 100 : 0;

                                        return (
                                            <div key={plan.planName} className="space-y-2 group">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-medium text-foreground group-hover:text-primary transition-colors">{plan.planName}</span>
                                                    <span className="text-xs font-mono text-muted-foreground bg-background px-2 py-0.5 rounded-full border shadow-sm">
                                                        {plan.count} ventas
                                                    </span>
                                                </div>
                                                <div className="h-2.5 rounded-full bg-muted/50 overflow-hidden shadow-inner">
                                                    <div
                                                        className={`h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-1000 ease-out`}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                    {metrics?.salesByPlan.length === 0 && (
                                        <p className="text-sm text-muted-foreground text-center py-8">
                                            No hay datos registrados.
                                        </p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* 3. UPCOMING EXPIRATIONS: Tinte sutil naranja/alerta */}
                    <Card className="lg:col-span-1 shadow-md border-l-4 border-l-orange-500 bg-gradient-to-br from-card to-orange-500/5">
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
                                <div className="space-y-3">
                                    {metrics?.upcomingExpirations?.map((member) => (
                                        <div
                                            key={member.id}
                                            className="flex items-center justify-between gap-3 p-3 rounded-xl bg-background/50 border border-transparent hover:border-orange-200 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-all duration-200 group cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Avatar className="h-9 w-9 shrink-0 ring-2 ring-background group-hover:ring-orange-200 transition-all">
                                                    <AvatarImage src={member.avatar || undefined} alt={member.name} />
                                                    <AvatarFallback className="bg-orange-100 text-orange-600 text-xs font-bold">
                                                        {member.name.split(" ").map((n) => n[0]).join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <Link href={`/${slug}/admin/members/${member.id}`} className="text-sm font-semibold text-foreground group-hover:text-orange-700 transition-colors truncate block">
                                                        {member.name}
                                                    </Link>
                                                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                                        <span className={cn("w-1.5 h-1.5 rounded-full", member.daysUntil === 0 ? "bg-red-500 animate-pulse" : "bg-orange-400")} />
                                                        {member.daysUntil === 0 ? `Vence hoy` :
                                                            member.daysUntil === 1 ? `Vence mañana` :
                                                                `Vence en ${member.daysUntil} días`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Badge variant="outline" className="text-[10px] sm:text-xs border-orange-200 text-orange-700 bg-orange-50 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800">
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

                    {/* 4. RECENT MEMBERS: Tinte sutil neutral/slate */}
                    <Card className="lg:col-span-1 shadow-md border-l-4 border-l-blue-500 bg-gradient-to-br from-card to-blue-500/5">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                                <Users className="h-4 w-4 text-blue-500" />
                                Miembros Recientes
                            </CardTitle>
                            <Link href={`/${slug}/admin/members`}>
                                <Button variant="ghost" size="sm" className="gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 h-8 px-2">
                                    <span className="text-xs">Ver todos</span>
                                    <ArrowRight className="h-3 w-3" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {metrics?.recentActivity.map((member) => (
                                        <div
                                            key={member.id}
                                            className="flex items-center justify-between gap-3 p-3 rounded-xl bg-background/50 border border-transparent hover:border-blue-200 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all duration-200 group"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Avatar className="h-9 w-9 shrink-0 ring-2 ring-background group-hover:ring-blue-200 transition-all">
                                                    <AvatarImage src={member.avatar || undefined} alt={member.name} />
                                                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-bold">
                                                        {member.name.split(" ").map((n) => n[0]).join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-foreground group-hover:text-blue-700 transition-colors truncate">
                                                        {member.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {member.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Badge variant={getPlanBadgeVariant(member.planName || "")} className="hidden sm:flex shadow-sm">
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