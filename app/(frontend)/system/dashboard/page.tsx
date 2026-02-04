import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, CreditCard, Activity } from "lucide-react";

export default function SystemDashboardPage() {
  // Aquí harías tus llamadas a Prisma: prisma.organization.count(), etc.
  const stats = [
    {
      title: "Total Gimnasios",
      value: "12",
      description: "+2 este mes",
      icon: Building2,
      color: "text-violet-500",
    },
    {
      title: "Usuarios Totales",
      value: "1,234",
      description: "+180 nuevos miembros",
      icon: Users,
      color: "text-pink-500",
    },
    {
      title: "Ingresos (MRR)",
      value: "$4,200",
      description: "+12% vs mes pasado",
      icon: CreditCard,
      color: "text-emerald-500",
    },
    {
      title: "Estado del Sistema",
      value: "99.9%",
      description: "Uptime operativo",
      icon: Activity,
      color: "text-sky-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          System Overview
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          Bienvenido al panel de control maestro.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={cn("h-4 w-4", stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Aquí podrías poner una gráfica o tabla de logs recientes */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Altas Recientes</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px] flex items-center justify-center text-slate-400">
              Gráfico de crecimiento aquí...
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Fake logs */}
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Iron Gym</p>
                  <p className="text-sm text-muted-foreground">
                    Nueva suscripción Pro
                  </p>
                </div>
                <div className="ml-auto font-medium text-green-600">+$299</div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Cobra Kai</p>
                  <p className="text-sm text-muted-foreground">
                    Registró 50 miembros
                  </p>
                </div>
                <div className="ml-auto font-medium text-slate-500">
                  Hace 2h
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper rápido para clases condicionales
function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
