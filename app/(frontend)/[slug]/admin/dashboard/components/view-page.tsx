"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    UserCheck,
    Clock,
    Activity,
    BarChart3,
    CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { useState, useEffect } from "react";
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
import { getQueryClient } from "@/lib/react-query/client-config";
import { historicStartDateKeys } from "@/lib/react-query/query-keys";
import { AttendanceModal } from "./attendance-modal";
import { DashboardService } from "@/lib/services/dashboard.service";
import { StatCardSkeleton } from "@/components/ui/skeletons/stat-card-skeleton";
import { ChartSkeleton } from "@/components/ui/skeletons/chart-skeleton";
import { ListSkeleton } from "@/components/ui/skeletons/list-skeleton";

// Helper para encabezados consistentes
function CardSectionHeader({ title, icon: Icon, colorClass, action }: { title: string, icon: any, colorClass: string, action?: React.ReactNode }) {
    return (
        <CardHeader className="pb-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-semibold flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", colorClass)}>
                    <Icon className="w-4 h-4" />
                </div>
                {title}
            </CardTitle>
            {action}
        </CardHeader>
    )
}

export default function DashboardViewPage() {
    const queryClient = getQueryClient()
    const params = useParams();
    const slug = params.slug as string;

    // Estado de Fechas
    const [date, setDate] = useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
    });
    const [grouping, setGrouping] = useState<'day' | 'month' | 'year'>('day');

    // Estado para el Scroll (Efecto Flotante)
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 80);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Fetch Metrics
    const { data: metrics, isLoading } = useDashboardMetrics({
        from: date?.from?.toISOString(),
        to: date?.to?.toISOString(),
        grouping,
    });

    const loading = isLoading;
    const [selectedPreset, setSelectedPreset] = useState<string | undefined>("thisMonth")

    // --- Lógica de Agrupación de Fechas ---
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
            case "today": newDate = { from: now, to: now }; break;
            case "yesterday": const yesterday = subDays(now, 1); newDate = { from: yesterday, to: yesterday }; break;
            case "thisWeek": newDate = { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfWeek(now, { weekStartsOn: 1 }) }; break;
            case "lastWeek": const lastWeek = subDays(now, 7); newDate = { from: startOfWeek(lastWeek, { weekStartsOn: 1 }), to: endOfWeek(lastWeek, { weekStartsOn: 1 }) }; break;
            case "last7days": newDate = { from: subDays(now, 6), to: now }; break;
            case "thisMonth": newDate = { from: startOfMonth(now), to: endOfMonth(now) }; break;
            case "lastMonth": const lastMonth = subMonths(now, 1); newDate = { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) }; break;
            case "thisSemester":
                const currentMonth = now.getMonth();
                if (currentMonth < 6) { newDate = { from: startOfYear(now), to: endOfMonth(setMonth(now, 5)) }; }
                else { newDate = { from: startOfMonth(setMonth(now, 6)), to: endOfYear(now) }; }
                setGrouping("month")
                break;
            case "lastSemester":
                const currentMonthLast = now.getMonth();
                if (currentMonthLast < 6) { const lastYear = subYears(now, 1); newDate = { from: startOfMonth(setMonth(lastYear, 6)), to: endOfYear(lastYear) }; }
                else { newDate = { from: startOfYear(now), to: endOfMonth(setMonth(now, 5)) }; }
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
                    if (historicDate) { newDate = { from: new Date(historicDate), to: now }; }
                    else { newDate = { from: subYears(now, 5), to: now }; }
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
            if (!available.includes(grouping)) { setGrouping('day'); }
        }
    };

    return (
        <DashboardLayout breadcrumbs={[{ label: "Admin" }, { label: "Panel General" }]}>
            <div className="space-y-8 pb-10 relative">

                {/* HEADER & FILTERS */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-h-[50px]">
                    <PageHeader
                        title={`Hola, ${slug} 👋`}
                        description="Resumen de actividad y rendimiento del gimnasio."
                    />

                    {/* Placeholder div to maintain layout space when button goes fixed */}
                    <div className={cn("hidden sm:block w-[280px]", isScrolled ? "opacity-0 pointer-events-none" : "opacity-0 hidden")} />

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant="outline"
                                className={cn(
                                    "justify-start text-left font-normal transition-all duration-500 ease-in-out z-50",
                                    // Estado Normal
                                    !isScrolled && "w-full sm:w-[280px] bg-background shadow-sm border-input hover:bg-muted/50 h-11 relative",
                                    // Estado Flotante (Sticky)
                                    isScrolled && "fixed top-4 right-4 sm:right-8 w-auto shadow-xl bg-background/80 backdrop-blur-md border-primary/20 hover:bg-background/90 hover:border-primary/40 rounded-full px-4 h-10 animate-in fade-in slide-in-from-top-2",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className={cn("h-4 w-4 opacity-70", isScrolled ? "mr-2" : "mr-2")} />
                                {date?.from ? (
                                    date.to ? (
                                        <span className="text-sm font-medium truncate">
                                            {format(date.from, "dd MMM", { locale: es })} - {format(date.to, "dd MMM, yyyy", { locale: es })}
                                        </span>
                                    ) : (
                                        format(date.from, "PPP", { locale: es })
                                    )
                                ) : (
                                    <span>Seleccionar periodo</span>
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
                                    onSelect={(range) => {
                                        setDate(range);
                                        setSelectedPreset(undefined);
                                        if (range?.from && range?.to) {
                                            const available = getAvailableGroupings(range.from, range.to);
                                            if (!available.includes(grouping)) setGrouping('day');
                                        }
                                    }}
                                    numberOfMonths={1}
                                    locale={es}
                                />
                                <div className="p-3 border-b sm:border-b-0 sm:border-r space-y-1 w-[165px] bg-muted/10">
                                    <span className="text-xs font-semibold text-muted-foreground px-2 mb-2 block">Rangos Rápidos</span>
                                    {["today", "yesterday", "thisWeek", "lastWeek", "thisMonth", "lastMonth"].map((preset) => (
                                        <Button
                                            key={preset}
                                            variant={selectedPreset === preset ? "secondary" : "ghost"}
                                            className={cn("w-full justify-start text-xs h-8", selectedPreset === preset && "bg-primary/10 text-primary hover:bg-primary/15")}
                                            onClick={() => handlePresetSelect(preset)}
                                        >
                                            {preset === "today" && "Hoy"}
                                            {preset === "yesterday" && "Ayer"}
                                            {preset === "thisWeek" && "Esta semana"}
                                            {preset === "lastWeek" && "Semana pasada"}
                                            {preset === "thisMonth" && "Este mes"}
                                            {preset === "lastMonth" && "Mes pasado"}
                                        </Button>
                                    ))}
                                    <div className="h-px bg-border/50 my-2" />
                                    {["thisSemester", "allTime"].map((preset) => (
                                        <Button
                                            key={preset}
                                            variant={selectedPreset === preset ? "secondary" : "ghost"}
                                            className={cn("w-full justify-start text-xs h-8", selectedPreset === preset && "bg-primary/10 text-primary")}
                                            onClick={() => handlePresetSelect(preset)}
                                        >
                                            {preset === "thisSemester" && "Este Semestre"}
                                            {preset === "allTime" && "Todo el historial"}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* KPI CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {loading ? (
                        <>
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                        </>
                    ) : (
                        <>
                            <StatCard
                                title="Miembros Activos"
                                value={metrics?.activeMembers.value ?? 0}
                                change={metrics?.activeMembers.percentageChange ?? 0}
                                icon={Users}
                                isLoading={loading}
                            />
                            <StatCard
                                title="Ingresos del Periodo"
                                value={metrics?.revenue.value.toLocaleString('es-PE', { style: 'currency', currency: metrics?.currency || 'PEN', maximumFractionDigits: 0 }) ?? 0}
                                change={metrics?.revenue.percentageChange ?? 0}
                                icon={DollarSign}
                                isLoading={loading}
                            />
                            <StatCard
                                title="Vencen en 7 días"
                                value={metrics?.expiringSoon ?? 0}
                                change={0}
                                icon={AlertTriangle}
                                isLoading={loading}
                            />
                        </>
                    )}
                </div>

                {/* QUICK ACTIONS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Link href={`/${slug}/admin/members/new`} className="group">
                        <Card className="h-full border-none shadow-sm hover:shadow-md bg-linear-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 transition-all cursor-pointer group-hover:-translate-y-1 duration-300">
                            <CardContent className="p-6 flex flex-col items-center justify-center gap-4 text-center h-full">
                                <div className="p-3 rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                    <UserPlus className="w-6 h-6" />
                                </div>
                                <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">Nuevo Miembro</span>
                            </CardContent>
                        </Card>
                    </Link>

                    <AttendanceModal>
                        <div className="group h-full cursor-pointer">
                            <Card className="h-full border-none shadow-sm hover:shadow-md bg-linear-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/10 transition-all group-hover:-translate-y-1 duration-300">
                                <CardContent className="p-6 flex flex-col items-center justify-center gap-4 text-center h-full">
                                    <div className="p-3 rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                                        <UserCheck className="w-6 h-6" />
                                    </div>
                                    <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Asistencia Rápida</span>
                                </CardContent>
                            </Card>
                        </div>
                    </AttendanceModal>

                    <Link href={`/${slug}/admin/sales`} className="group">
                        <Card className="h-full border-none shadow-sm hover:shadow-md bg-linear-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10 transition-all cursor-pointer group-hover:-translate-y-1 duration-300">
                            <CardContent className="p-6 flex flex-col items-center justify-center gap-4 text-center h-full">
                                <div className="p-3 rounded-xl bg-purple-500 text-white shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                                    <CreditCard className="w-6 h-6" />
                                </div>
                                <span className="text-sm font-semibold text-purple-900 dark:text-purple-100">Nueva Venta</span>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href={`/${slug}/admin/memberships`} className="group">
                        <Card className="h-full border-none shadow-sm hover:shadow-md bg-linear-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10 transition-all cursor-pointer group-hover:-translate-y-1 duration-300">
                            <CardContent className="p-6 flex flex-col items-center justify-center gap-4 text-center h-full">
                                <div className="p-3 rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                                    <Dumbbell className="w-6 h-6" />
                                </div>
                                <span className="text-sm font-semibold text-orange-900 dark:text-orange-100">Membresías</span>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                {/* MAIN GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* CHART SECTION */}
                    <Card className="lg:col-span-3 border-none shadow-lg bg-linear-to-b from-card to-muted/30 relative overflow-hidden">
                        {/* Decoración de fondo */}
                        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

                        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/40 relative z-10">
                            <div className="space-y-1">
                                <CardTitle className="flex items-center gap-3">
                                    <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                                        <BarChart3 className="w-5 h-5" />
                                    </div>
                                    Ingresos Financieros
                                </CardTitle>
                                <CardDescription>Comportamiento de ventas en el periodo seleccionado</CardDescription>
                            </div>
                            <Select value={grouping} onValueChange={(v) => setGrouping(v as "day" | "month" | "year")}>
                                <SelectTrigger className="w-[140px] bg-background shadow-sm h-10 text-sm border-input">
                                    <SelectValue placeholder="Agrupar" />
                                </SelectTrigger>
                                <SelectContent align="end">
                                    <SelectItem value="day">Diario</SelectItem>
                                    {date?.from && date?.to && differenceInDays(date.to, date.from) >= 60 && <SelectItem value="month">Mensual</SelectItem>}
                                    {date?.from && date?.to && differenceInDays(date.to, date.from) >= 365 && <SelectItem value="year">Anual</SelectItem>}
                                </SelectContent>
                            </Select>
                        </CardHeader>
                        <CardContent className="pt-8 pl-2 pr-6 relative z-10">
                            {loading ? <div className="h-[350px]"><ChartSkeleton /></div> : (
                                <div className="h-[350px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={metrics?.revenueOverTime || []} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.05} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                                            <XAxis
                                                dataKey="month"
                                                tickFormatter={(val) => {
                                                    const d = new Date(val);
                                                    if (grouping === 'day') return format(d, "dd MMM", { locale: es });
                                                    if (grouping === 'month') return format(d, "MMM", { locale: es });
                                                    return format(d, "yyyy");
                                                }}
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                                dy={10}
                                                tick={{ fill: 'var(--muted-foreground)' }}
                                                fontWeight={500}
                                            />
                                            <YAxis
                                                tickFormatter={(val) => new Intl.NumberFormat('es-PE', { currency: metrics?.currency || 'PEN', style: 'currency', maximumFractionDigits: 0 }).format(val)}
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fill: 'var(--muted-foreground)' }}
                                                width={90}
                                                fontWeight={500}
                                                dx={-10}
                                            />
                                            <Tooltip
                                                // CORRECCIÓN: 'fill' para el fondo del hover en modo claro. opacity muy baja para que sea sutil.
                                                cursor={{ fill: 'var(--foreground)', opacity: 0.05, radius: 6 }}
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        return (
                                                            // Tooltip estilo "Frosted Glass"
                                                            <div className="bg-background/80 backdrop-blur-md border border-border/50 p-4 rounded-2xl shadow-xl">
                                                                <p className="text-sm font-medium text-muted-foreground mb-2">
                                                                    {format(new Date(payload[0].payload.month), grouping === 'year' ? 'yyyy' : 'PPP', { locale: es })}
                                                                </p>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                                                                    <p className="text-2xl font-bold text-foreground">
                                                                        {payload[0].value?.toLocaleString('es-PE', { style: 'currency', currency: metrics?.currency || 'PEN' })}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Bar
                                                dataKey="revenue"
                                                fill="url(#colorRevenue)"
                                                radius={[8, 8, 2, 2]}
                                                maxBarSize={60}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* POPULAR PLANS */}
                    <Card className="lg:col-span-1 shadow-md border-l-[6px] border-l-primary bg-linear-to-br from-card to-primary/5 overflow-hidden">
                        <CardSectionHeader
                            title="Planes Populares"
                            icon={Activity}
                            colorClass="bg-primary/10 text-primary"
                        />
                        <CardContent className="space-y-6">
                            {loading ? <ListSkeleton itemCount={4} /> : (
                                metrics?.salesByPlan.sort((a, b) => b.count - a.count).slice(0, 5).map((plan) => {
                                    const total = metrics.salesByPlan.reduce((acc, curr) => acc + curr.count, 0);
                                    const percent = total > 0 ? (plan.count / total) * 100 : 0;

                                    return (
                                        <div key={plan.planName} className="group">
                                            <div className="flex justify-between items-center text-sm mb-2">
                                                <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{plan.planName}</span>
                                                <Badge variant="secondary" className="font-mono shadow-none bg-primary/5 text-primary border-primary/20">
                                                    {plan.count} ventas
                                                </Badge>
                                            </div>
                                            <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden shadow-inner">
                                                <div
                                                    className="h-full bg-linear-to-r from-primary to-primary/80 rounded-full transition-all duration-1000 ease-out group-hover:shadow-[0_0_10px_var(--primary)]"
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                            {!loading && metrics?.salesByPlan.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-8 opacity-70">
                                    <Activity className="w-10 h-10 mb-2 stroke-1" />
                                    <p className="text-sm">Sin datos de ventas</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* UPCOMING EXPIRATIONS */}
                    <Card className="lg:col-span-1 shadow-md border-l-[6px] border-l-orange-500 bg-linear-to-br from-card to-orange-500/5 overflow-hidden">
                        <CardSectionHeader
                            title="Próximos Vencimientos"
                            icon={Clock}
                            colorClass="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                        />
                        <CardContent className="space-y-4">
                            {loading ? <ListSkeleton itemCount={4} /> : (
                                metrics?.upcomingExpirations?.slice(0, 5).map((member) => (
                                    <Link href={`/${slug}/admin/members/${member.id}`} key={member.id} className="block group">
                                        <div className="flex items-center gap-3 p-3 rounded-xl border border-transparent bg-background/50 hover:bg-orange-50/80 dark:hover:bg-orange-900/10 hover:border-orange-200/50 dark:hover:border-orange-800/50 transition-all shadow-xs hover:shadow-sm">
                                            <Avatar className="h-10 w-10 border-2 border-orange-100 dark:border-orange-900 group-hover:border-orange-300 transition-colors">
                                                <AvatarImage src={member.avatar || undefined} />
                                                <AvatarFallback className="bg-linear-to-br from-orange-100 to-amber-100 text-orange-700 text-xs font-bold">
                                                    {member.name.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0 py-1">
                                                <p className="text-sm font-semibold truncate text-foreground group-hover:text-orange-800 dark:group-hover:text-orange-300 transition-colors">
                                                    {member.name}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline" className={cn(
                                                        "text-[10px] font-medium border py-0.5 px-2 rounded-md shadow-none",
                                                        member.daysUntil <= 2
                                                            ? "bg-red-50 text-red-700 border-red-200 animate-pulse dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                                                            : "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800"
                                                    )}>
                                                        {member.daysUntil === 0 ? "Vence hoy" : member.daysUntil === 1 ? "Vence mañana" : `${member.daysUntil} días`}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-mono text-muted-foreground font-medium block">
                                                    {format(new Date(member.endDate), "dd")}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground uppercase">
                                                    {format(new Date(member.endDate), "MMM")}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                            {!loading && (!metrics?.upcomingExpirations || metrics.upcomingExpirations.length === 0) && (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-8 opacity-70">
                                    <CheckCircle2 className="w-10 h-10 mb-2 stroke-1 text-green-500" />
                                    <p className="text-sm">Todo al día 🎉</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* RECENT MEMBERS */}
                    <Card className="lg:col-span-1 shadow-md border-l-[6px] border-l-blue-500 bg-linear-to-br from-card to-blue-500/5 overflow-hidden">
                        <CardSectionHeader
                            title="Actividad Reciente"
                            icon={Users}
                            colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                            action={
                                <Button variant="ghost" size="sm" className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20" asChild>
                                    <Link href={`/${slug}/admin/members`}>Ver todos <ArrowRight className="ml-1 w-3 h-3" /></Link>
                                </Button>
                            }
                        />
                        <CardContent className="space-y-4">
                            {loading ? <ListSkeleton itemCount={4} /> : (
                                metrics?.recentActivity.slice(0, 5).map((member) => (
                                    <Link href={`/${slug}/admin/members/${member.id}`} key={member.id} className="block group">
                                        <div className="flex items-center gap-3 p-3 rounded-xl border border-transparent bg-background/50 hover:bg-blue-50/80 dark:hover:bg-blue-900/10 hover:border-blue-200/50 dark:hover:border-blue-800/50 transition-all shadow-xs hover:shadow-sm">
                                            <Avatar className="h-10 w-10 border-2 border-blue-100 dark:border-blue-900 group-hover:border-blue-300 transition-colors">
                                                <AvatarImage src={member.avatar || undefined} />
                                                <AvatarFallback className="bg-linear-to-br from-blue-100 to-indigo-100 text-blue-700 text-xs font-bold">
                                                    {member.name.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0 py-1">
                                                <p className="text-sm font-semibold truncate text-foreground group-hover:text-blue-800 dark:group-hover:text-blue-300 transition-colors">
                                                    {member.name}
                                                </p>
                                                {member.planName && (
                                                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                                        <CreditCard className="w-3 h-3 opacity-70" /> {member.planName}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                            {!loading && metrics?.recentActivity.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-8 opacity-70">
                                    <Users className="w-10 h-10 mb-2 stroke-1" />
                                    <p className="text-sm">Sin actividad reciente</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}