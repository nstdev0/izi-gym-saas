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
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

// ==============================================
// MOCK DATA - Replace with real data fetching
// ==============================================

const mockStats = {
    totalMembers: 1247,
    membersChange: 12.5,
    activeMembers: 892,
    activeChange: 8.3,
    monthlyRevenue: 45680,
    revenueChange: 15.2,
    expiringMemberships: 24,
    expiringChange: -5.0,
};

const mockRecentMembers = [
    {
        id: "1",
        name: "Carlos Mendoza",
        email: "carlos@email.com",
        avatar: "",
        plan: "Premium",
        joinedAt: "Hace 2 horas",
    },
    {
        id: "2",
        name: "María García",
        email: "maria@email.com",
        avatar: "",
        plan: "Básico",
        joinedAt: "Hace 5 horas",
    },
    {
        id: "3",
        name: "Juan Pérez",
        email: "juan@email.com",
        avatar: "",
        plan: "Premium",
        joinedAt: "Ayer",
    },
    {
        id: "4",
        name: "Ana Rodríguez",
        email: "ana@email.com",
        avatar: "",
        plan: "Elite",
        joinedAt: "Hace 2 días",
    },
];

const mockExpiringMemberships = [
    {
        id: "1",
        memberName: "Roberto Silva",
        plan: "Premium",
        expiresIn: "2 días",
        avatar: "",
    },
    {
        id: "2",
        memberName: "Laura Martínez",
        plan: "Básico",
        expiresIn: "3 días",
        avatar: "",
    },
    {
        id: "3",
        memberName: "Diego López",
        plan: "Elite",
        expiresIn: "5 días",
        avatar: "",
    },
    {
        id: "4",
        memberName: "Carmen Ruiz",
        plan: "Premium",
        expiresIn: "7 días",
        avatar: "",
    },
];

const mockRecentActivity = [
    {
        id: "1",
        type: "new_member",
        message: "Nuevo miembro registrado: Carlos Mendoza",
        time: "Hace 2 horas",
        icon: UserPlus,
    },
    {
        id: "2",
        type: "renewal",
        message: "Membresía renovada: Laura Martínez",
        time: "Hace 3 horas",
        icon: RefreshCw,
    },
    {
        id: "3",
        type: "payment",
        message: "Pago recibido: $150.00 - Plan Premium",
        time: "Hace 4 horas",
        icon: CreditCard,
    },
    {
        id: "4",
        type: "expiring",
        message: "Membresía por vencer: Diego López",
        time: "Hace 5 horas",
        icon: AlertTriangle,
    },
    {
        id: "5",
        type: "new_member",
        message: "Nuevo miembro registrado: María García",
        time: "Hace 6 horas",
        icon: UserPlus,
    },
];

const mockTopPlans = [
    { name: "Premium", members: 456, percentage: 45, color: "bg-primary" },
    { name: "Básico", members: 312, percentage: 30, color: "bg-blue-500" },
    { name: "Elite", members: 189, percentage: 18, color: "bg-purple-500" },
    { name: "Estudiante", members: 72, percentage: 7, color: "bg-green-500" },
];

// ==============================================
// COMPONENTS
// ==============================================

interface StatCardProps {
    title: string;
    value: string | number;
    change: number;
    icon: React.ElementType;
    prefix?: string;
}

function StatCard({ title, value, change, icon: Icon, prefix = "" }: StatCardProps) {
    const isPositive = change >= 0;

    return (
        <Card className="relative overflow-hidden">
            <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                            {title}
                        </p>
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
                        </p>
                        <div className="flex items-center gap-1">
                            {isPositive ? (
                                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                            ) : (
                                <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                            )}
                            <span
                                className={`text-xs sm:text-sm font-medium ${isPositive ? "text-green-500" : "text-red-500"
                                    }`}
                            >
                                {isPositive ? "+" : ""}{change}%
                            </span>
                            <span className="text-xs text-muted-foreground">vs mes anterior</span>
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

    return (
        <DashboardLayout
            breadcrumbs={[{ label: "Admin" }, { label: "Dashboard" }]}
        >
            <div className="flex flex-col space-y-4 sm:space-y-6 overflow-auto pb-4 scrollbar-hide">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                            Dashboard
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Resumen general de tu gimnasio
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                            <Calendar className="h-4 w-4" />
                            <span className="hidden sm:inline">Últimos 30 días</span>
                            <span className="sm:hidden">30 días</span>
                        </Button>
                    </div>
                </div>

                {/* KPI Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <StatCard
                        title="Total Miembros"
                        value={mockStats.totalMembers}
                        change={mockStats.membersChange}
                        icon={Users}
                    />
                    <StatCard
                        title="Miembros Activos"
                        value={mockStats.activeMembers}
                        change={mockStats.activeChange}
                        icon={Activity}
                    />
                    <StatCard
                        title="Ingresos del Mes"
                        value={mockStats.monthlyRevenue}
                        change={mockStats.revenueChange}
                        icon={DollarSign}
                        prefix="$"
                    />
                    <StatCard
                        title="Por Vencer"
                        value={mockStats.expiringMemberships}
                        change={mockStats.expiringChange}
                        icon={AlertTriangle}
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
                            <div className="space-y-3 sm:space-y-4">
                                {mockRecentMembers.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between gap-3 p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Avatar className="h-9 w-9 sm:h-10 sm:w-10 shrink-0">
                                                <AvatarImage src={member.avatar} alt={member.name} />
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
                                            <Badge variant={getPlanBadgeVariant(member.plan)} className="hidden sm:flex">
                                                {member.plan}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                {member.joinedAt}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
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
                            <div className="space-y-3">
                                {mockExpiringMemberships.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Avatar className="h-8 w-8 shrink-0">
                                                <AvatarImage src={item.avatar} alt={item.memberName} />
                                                <AvatarFallback className="bg-amber-500/10 text-amber-600 text-xs">
                                                    {item.memberName.split(" ").map((n) => n[0]).join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">
                                                    {item.memberName}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.plan}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="shrink-0 text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30">
                                            {item.expiresIn}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Second Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Activity Feed */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <CardTitle className="text-base sm:text-lg font-semibold">
                                Actividad Reciente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                            <div className="space-y-3">
                                {mockRecentActivity.map((activity) => {
                                    const Icon = activity.icon;
                                    return (
                                        <div
                                            key={activity.id}
                                            className="flex items-start gap-3 p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <div
                                                className={`rounded-full p-2 shrink-0 ${activity.type === "new_member"
                                                    ? "bg-green-500/10 text-green-600"
                                                    : activity.type === "renewal"
                                                        ? "bg-blue-500/10 text-blue-600"
                                                        : activity.type === "payment"
                                                            ? "bg-primary/10 text-primary"
                                                            : "bg-amber-500/10 text-amber-600"
                                                    }`}
                                            >
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-foreground">
                                                    {activity.message}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {activity.time}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Plans */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                                <Dumbbell className="h-4 w-4 text-primary" />
                                Planes Populares
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                            <div className="space-y-4">
                                {mockTopPlans.map((plan) => (
                                    <div key={plan.name} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium text-foreground">{plan.name}</span>
                                            <span className="text-muted-foreground">
                                                {plan.members} miembros
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${plan.color} transition-all duration-500`}
                                                style={{ width: `${plan.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base sm:text-lg font-semibold">
                            Acciones Rápidas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <Link href={`/${slug}/admin/members/new`}>
                                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                                    <UserPlus className="h-5 w-5 text-primary" />
                                    <span className="text-xs sm:text-sm">Nuevo Miembro</span>
                                </Button>
                            </Link>
                            <Link href={`/${slug}/admin/members`}>
                                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                                    <Users className="h-5 w-5 text-primary" />
                                    <span className="text-xs sm:text-sm">Ver Miembros</span>
                                </Button>
                            </Link>
                            <Link href={`/${slug}/admin/memberships`}>
                                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                                    <CreditCard className="h-5 w-5 text-primary" />
                                    <span className="text-xs sm:text-sm">Membresías</span>
                                </Button>
                            </Link>
                            <Link href={`/${slug}/admin/users`}>
                                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                                    <Dumbbell className="h-5 w-5 text-primary" />
                                    <span className="text-xs sm:text-sm">Usuarios</span>
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
