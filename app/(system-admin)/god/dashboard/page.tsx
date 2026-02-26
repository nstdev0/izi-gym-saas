import { prisma } from "@/server/infrastructure/persistence/prisma";
import { requireGodMode } from "@/server/infrastructure/auth/god-mode";
import { Building2, Users, CreditCard, TrendingUp, Activity, DollarSign, Package, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function GodModeDashboardPage() {
    await requireGodMode();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Consultas concurrentes avanzadas
    const [
        totalActiveOrgs,
        newSignups30Days,
        planDistribution,
        subscriptions, // Usado para MRR
        recentOrgs
    ] = await Promise.all([
        // 1. Organizaciones activas (que no están eliminadas y están marcadas const isActive=true)
        prisma.organization.count({ where: { deletedAt: null, isActive: true } }),

        // 2. Nuevos registros de organizaciones en los últimos 30 días
        prisma.organization.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),

        // 3. Distribución de planes (Agrupación)
        prisma.organization.groupBy({
            by: ['organizationPlan'],
            _count: { organizationPlan: true },
        }),

        // 4. Suscripciones para el cálculo del MRR estimado (Suscripciones activas de Stripe)
        // O si no grabas precio en DB, esto puede ser un proxy en base al plan.
        prisma.subscription.findMany({
            where: { status: 'ACTIVE' },
            include: { plan: true }
        }),

        // 5. Últimas 5 organizaciones creadas
        prisma.organization.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, name: true, slug: true, createdAt: true, organizationPlan: true }
        })
    ]);

    // Extraer distribuciones
    const freeCount = planDistribution.find(p => p.organizationPlan?.includes("FREE"))?._count.organizationPlan || 0;
    const proCount = planDistribution.find(p => p.organizationPlan?.includes("PRO"))?._count.organizationPlan || 0;
    const enterpriseCount = planDistribution.find(p => p.organizationPlan?.includes("ENTERPRISE"))?._count.organizationPlan || 0;

    // Cálculo rápido de MRR Estimado (Ejemplo estático si no tienes el monto exacto en tabla Subscription)
    const mrr = (proCount * 49) + (enterpriseCount * 99);

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard & KPIs</h1>
                <p className="text-muted-foreground mt-2">
                    Visión global técnica y comercial del sistema B2B (Métricas en tiempo real de DB).
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-card hover:bg-muted/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Gimnasios Activos</CardTitle>
                        <Building2 className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalActiveOrgs}</div>
                        <p className="text-xs text-muted-foreground mt-1 text-emerald-500 flex items-center gap-1">
                            <Activity className="w-3 h-3" /> Estado Saludable
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card hover:bg-muted/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Nuevos Registros (30d)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-sky-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{newSignups30Days}</div>
                        <p className="text-xs text-muted-foreground mt-1">Gimnasios registrados en el último mes</p>
                    </CardContent>
                </Card>

                <Card className="bg-card hover:bg-muted/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">MRR Estimado</CardTitle>
                        <DollarSign className="h-4 w-4 text-violet-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${mrr.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">Ingreso Mensual Recurrente</p>
                    </CardContent>
                </Card>

                <Card className="bg-card hover:bg-muted/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Suscripciones Stripe</CardTitle>
                        <CreditCard className="h-4 w-4 text-pink-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{subscriptions.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Webhooks procesados y sincronizados</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Distribución de Planes */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Distribución Energética (Planes)</CardTitle>
                        <CardDescription>Repartición actual de la base de clientes instalada.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Free Trial</span>
                                </div>
                                <span className="text-sm font-medium">{freeCount} orgs</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div className="bg-muted-foreground h-2 rounded-full" style={{ width: `${(freeCount / totalActiveOrgs) * 100}%` }}></div>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-2">
                                    <Crown className="h-4 w-4 text-sky-500" />
                                    <span className="text-sm font-medium">Pro</span>
                                </div>
                                <span className="text-sm font-medium">{proCount} orgs</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div className="bg-sky-500 h-2 rounded-full" style={{ width: `${(proCount / totalActiveOrgs) * 100}%` }}></div>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-violet-500" />
                                    <span className="text-sm font-medium">Enterprise</span>
                                </div>
                                <span className="text-sm font-medium">{enterpriseCount} orgs</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div className="bg-violet-500 h-2 rounded-full" style={{ width: `${(enterpriseCount / totalActiveOrgs) * 100}%` }}></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Actividad Reciente */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Feed de Actividad (Nuevos Tenants)</CardTitle>
                        <CardDescription>Últimos gimnasios integrados a la plataforma.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-5">
                            {recentOrgs.map(org => (
                                <div key={org.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">{org.name}</p>
                                            <p className="text-xs text-muted-foreground">{org.slug}</p>
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 items-center justify-end gap-2">
                                        <Badge variant="outline" className="text-[10px]">
                                            {org.organizationPlan || 'FREE'}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {org.createdAt.toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
