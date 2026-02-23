"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Check,
    ArrowRight,
    Users,
    CreditCard,
    BarChart3,
    Shield,
    Zap,
    Star,
    ChevronRight,
    Dumbbell,
    Clock,
    TrendingUp,
} from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

const PRICING_PLANS = [
    {
        name: "Prueba gratis",
        description: "Para gimnasios pequeños y recién empezando.",
        monthlySlug: "free-trial",
        priceMonthly: "$0",
        features: ["Hasta 50 miembros", "Gestión de asistencias", "Soporte básico"],
        popular: false,
        cta: "Comenzar Gratis"
    },
    {
        name: "Pro",
        description: "El más popular. Para gimnasios en crecimiento.",
        monthlySlug: "pro-monthly",
        yearlySlug: "pro-yearly",
        priceMonthly: "$49",
        priceYearly: "$529",
        features: ["Miembros ilimitados", "CRM avanzado", "Soporte prioritario 24/7", "Prueba gratis 14 días sin TC"],
        popular: true,
        cta: "Prueba 14 días gratis"
    },
    {
        name: "Enterprise",
        description: "Sedes múltiples y volumen alto de clientes.",
        monthlySlug: "enterprise-monthly",
        yearlySlug: "enterprise-yearly",
        priceMonthly: "$99",
        priceYearly: "$1069",
        features: ["Sedes ilimitadas", "Marca blanca", "API de Integración", "Prueba gratis 14 días sin TC"],
        popular: false,
        cta: "Empezar Enterprise"
    }
];

export function LandingPage({ dashboardUrl, isLoggedIn }: { dashboardUrl?: string, isLoggedIn?: boolean }) {
    const [isYearly, setIsYearly] = useState(false);

    return (
        <div className="h-screen w-full overflow-y-auto bg-background scroll-smooth scrollbar-hide">
            {/* Navbar */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary p-2 rounded-lg">
                            <Dumbbell className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold">IziGym</span>
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Características</a>
                        <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Precios</a>
                        <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Testimonios</a>
                    </nav>
                    <div className="flex gap-3 items-center">
                        {isLoggedIn ? (
                            <Link href={dashboardUrl || "/sign-in"}>
                                <Button>Ir a mi panel</Button>
                            </Link>
                        ) : (
                            <>
                                <Link href="/sign-in">
                                    <Button variant="ghost">Iniciar Sesión</Button>
                                </Link>
                                <Link href="#pricing">
                                    <Button>Empezar</Button>
                                </Link>
                            </>
                        )}
                        <ModeToggle />
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 sm:py-32">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-linear-to-br from-primary/20 via-primary/5 to-transparent rounded-full blur-3xl opacity-60 dark:opacity-40" />
                    <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-linear-to-tl from-blue-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl opacity-40" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                            <Zap className="h-4 w-4" />
                            <span>Software #1 para gimnasios en Latinoamérica</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
                            El sistema que tu gimnasio
                            <span className="block mt-2 bg-linear-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent">
                                necesita para crecer
                            </span>
                        </h1>

                        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                            Automatiza cobros, gestiona miembros, controla accesos y analiza tu negocio.
                            <strong className="text-foreground"> Todo en una sola plataforma.</strong>
                        </p>

                        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                            <Link href={isLoggedIn ? (dashboardUrl || "/sign-in") : "/sign-up?plan=pro-monthly"}>
                                <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                                    {isLoggedIn ? "Ir a mi Panel" : "Prueba Gratis 14 Días"}
                                </Button>
                            </Link>
                            {!isLoggedIn &&
                                <Link href="#pricing">
                                    <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                                        Ver Precios
                                    </Button>
                                </Link>
                            }
                        </div>

                        <p className="mt-4 text-sm text-muted-foreground">
                            ✓ Sin tarjeta de crédito &nbsp; ✓ Configuración en 5 minutos &nbsp; ✓ Soporte 24/7
                        </p>
                    </div>

                    <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-3xl mx-auto">
                        {[
                            { value: "500+", label: "Gimnasios activos" },
                            { value: "50K+", label: "Miembros gestionados" },
                            { value: "99.9%", label: "Uptime garantizado" },
                            { value: "$2M+", label: "Cobros procesados" },
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-3xl sm:text-4xl font-bold text-foreground">{stat.value}</div>
                                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Problem/Solution Section */}
            <section className="py-20 bg-muted/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold">¿Te suena familiar?</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 sm:p-8">
                            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">😫 Sin IziGym</h3>
                            <ul className="space-y-3 text-muted-foreground">
                                {[
                                    "Cobros manuales que se olvidan",
                                    "Excel infinitos para controlar miembros",
                                    "No sabes quién pagó y quién no",
                                    "Clientes que entran sin membresía activa",
                                    "Cero visibilidad de tu negocio",
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <span className="text-red-500">✗</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-6 sm:p-8">
                            <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-4">🚀 Con IziGym</h3>
                            <ul className="space-y-3 text-muted-foreground">
                                {[
                                    "Cobros automáticos con Stripe",
                                    "Dashboard unificado y en tiempo real",
                                    "Alertas de membresías por vencer",
                                    "Control de acceso inteligente",
                                    "Reportes y métricas accionables",
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-green-500 shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-20 sm:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold">
                            Todo lo que necesitas, <span className="text-primary">lo tienes</span>
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                            Herramientas diseñadas específicamente para gimnasios y centros de fitness
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                icon: Users, title: "Gestión de Miembros", desc: "Base de datos completa con fotos, historial de pagos, fecha de vencimiento y estado activo.", color: "text-blue-500", gradient: "from-blue-500/5 to-blue-500/10", border: "border-l-blue-500"
                            },
                            {
                                icon: CreditCard, title: "Cobros Automáticos", desc: "Integración con Stripe para cobros recurrentes. Olvídate de perseguir pagos.", color: "text-green-500", gradient: "from-green-500/5 to-green-500/10", border: "border-l-green-500"
                            },
                            {
                                icon: Shield, title: "Control de Acceso", desc: "Valida asistencias en tiempo real. QR o manual.", color: "text-purple-500", gradient: "from-purple-500/5 to-purple-500/10", border: "border-l-purple-500"
                            },
                            {
                                icon: BarChart3, title: "Reportes Inteligentes", desc: "Métricas de ingresos, retención, asistencia y crecimiento en un solo lugar.", color: "text-orange-500", gradient: "from-orange-500/5 to-orange-500/10", border: "border-l-orange-500"
                            },
                            {
                                icon: Clock, title: "Gestión de Clases", desc: "Horarios, reservas de cupos con límites y recordatorios automáticos.", color: "text-cyan-500", gradient: "from-cyan-500/5 to-cyan-500/10", border: "border-l-cyan-500"
                            },
                        ].map((feature, i) => (
                            <div key={i} className={`group p-6 rounded-2xl border border-transparent bg-linear-to-br ${feature.gradient} shadow-md border-l-4 ${feature.border} hover:shadow-lg transition-all duration-300`}>
                                <div className={`inline-flex p-3 rounded-xl bg-background/50 shadow-sm ${feature.color}`}>
                                    <feature.icon className="h-6 w-6" />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                                <p className="mt-2 text-muted-foreground">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Dynamic Pricing Section */}
            <section id="pricing" className="py-20 sm:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold">Precios simples, sin sorpresas</h2>
                        <p className="mt-4 text-lg text-muted-foreground">Empieza gratis, escala cuando crezcas</p>
                    </div>

                    {/* Toggle Mensual/Anual */}
                    <div className="flex items-center justify-center gap-3 mb-12">
                        <Label htmlFor="billing-cycle-landing" className={!isYearly ? "font-bold" : "text-muted-foreground"}>
                            Mensual
                        </Label>
                        <Switch
                            id="billing-cycle-landing"
                            checked={isYearly}
                            onCheckedChange={setIsYearly}
                        />
                        <Label htmlFor="billing-cycle-landing" className={isYearly ? "font-bold" : "text-muted-foreground"}>
                            Anual <span className="text-green-500 font-medium ml-1">(Ahorra ~20%)</span>
                        </Label>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {PRICING_PLANS.map((plan) => {
                            const isFreePlan = plan.monthlySlug === "free-trial";
                            const slug = (isYearly && plan.yearlySlug) ? plan.yearlySlug : plan.monthlySlug;
                            const price = (isYearly && plan.priceYearly) ? plan.priceYearly : plan.priceMonthly;
                            const cycleText = isFreePlan ? 'siempre' : (isYearly ? 'año' : 'mes');

                            return (
                                <div key={plan.name} className={`relative flex flex-col rounded-2xl border bg-card text-card-foreground transition-all duration-300 ${plan.popular ? 'border-primary/50 bg-linear-to-b from-primary/10 to-background shadow-lg shadow-primary/10 scale-105 ring-1 ring-primary' : 'hover:bg-muted/30 hover:border-border'}`}>
                                    {plan.popular && (
                                        <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-1/2">
                                            <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                                Más Popular
                                            </span>
                                        </div>
                                    )}
                                    <div className="p-6 md:p-8 flex flex-col space-y-1.5">
                                        <h3 className="font-semibold leading-none tracking-tight text-2xl">{plan.name}</h3>
                                        <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                                    </div>
                                    <div className="p-6 md:p-8 pt-0 grow">
                                        <div className="mb-6 flex items-baseline gap-1">
                                            <span className="text-4xl font-extrabold">{price}</span>
                                            <span className="text-muted-foreground font-medium">/{cycleText}</span>
                                        </div>
                                        <ul className="space-y-3">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="flex items-start gap-3">
                                                    <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                                                        <Check className="h-3 w-3 text-primary shrink-0" />
                                                    </div>
                                                    <span className="text-sm font-medium">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="p-6 md:p-8 pt-0 mt-auto">
                                        {/* El cambio principal: Usamos Link en lugar de onClick */}
                                        <Link href={`/sign-up?plan=${slug}`} className="w-full block">
                                            <Button
                                                className="w-full font-semibold"
                                                variant={plan.popular ? "default" : "outline"}
                                            >
                                                {plan.cta}
                                                <ChevronRight className="ml-1 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-20 bg-muted/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold">Dueños de gimnasios confían en IziGym</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { quote: "Pasé de cobrar manualmente a 200 miembros en Excel, a tener todo automatizado. Recuperé 15 horas al mes.", name: "Carlos Mendoza", role: "Power Fitness Gym", rating: 5 },
                            { quote: "El control de acceso es increíble. Ya nadie entra sin pagar. Reduje la morosidad en un 40%.", name: "María González", role: "FitZone Bogotá", rating: 5 },
                            { quote: "Los reportes me ayudaron a identificar cuál plan vendía más. Ahora facturo 30% más por las decisiones basadas en datos.", name: "Roberto Silva", role: "Iron Temple CDMX", rating: 5 },
                        ].map((testimonial, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-linear-to-b from-card to-muted/20 border border-border/50 shadow-sm hover:shadow-md transition-all">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, j) => (
                                        <Star key={j} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-muted-foreground italic">&quot;{testimonial.quote}&quot;</p>
                                <div className="mt-6 flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-linear-to-br from-primary to-blue-500" />
                                    <div>
                                        <div className="font-semibold">{testimonial.name}</div>
                                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 sm:py-32">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="bg-linear-to-br from-primary/10 via-blue-500/10 to-purple-500/10 rounded-3xl p-8 sm:p-12 border border-primary/20">
                        <TrendingUp className="h-12 w-12 text-primary mx-auto mb-6" />
                        <h2 className="text-3xl sm:text-4xl font-bold">¿Listo para hacer crecer tu gimnasio?</h2>
                        <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
                            Únete a cientos de dueños de gimnasios que ya optimizaron sus operaciones con IziGym
                        </p>
                        <div className="mt-8">
                            <Link href="/sign-up?plan=free-trial">
                                <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/25">
                                    Comenzar Gratis
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary p-1.5 rounded-lg">
                                <Dumbbell className="h-4 w-4 text-primary-foreground" />
                            </div>
                            <span className="font-semibold">IziGym</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            © {new Date().getFullYear()} IziGym. Todos los derechos reservados.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}