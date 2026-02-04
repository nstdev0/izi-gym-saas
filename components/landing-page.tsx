"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

export function LandingPage({ dashboardUrl, isLoggedIn }: { dashboardUrl?: string, isLoggedIn?: boolean }) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Navbar */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="text-xl font-bold text-slate-900 dark:text-white">IziGym</div>
                    <div className="flex gap-4 items-center">
                        {isLoggedIn ? (
                            <Link href={dashboardUrl || "/sign-in"}>
                                <Button>Ir al Dashboard</Button>
                            </Link>
                        ) : (
                            <Link href="/sign-in">
                                <Button>Iniciar Sesión</Button>
                            </Link>
                        )}
                        <ModeToggle />
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="py-24 text-center">
                <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Gestiona tu gimnasio con <span className="text-blue-600 dark:text-blue-400">Poder</span>
                </h1>
                <p className="mt-6 text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                    La plataforma completa para dueños de gimnasios ambiciosos. Control de acceso, pagos, miembros y más.
                </p>
                <div className="mt-10 flex justify-center gap-4">
                    <Link href={isLoggedIn ? (dashboardUrl || "/sign-in") : "/sign-up"}>
                        <Button size="lg" className="w-full sm:w-auto">
                            {isLoggedIn ? "Ir a mi Panel" : "Comenzar Prueba Gratis"}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                    {!isLoggedIn && (
                        <Link href="/pricing">
                            <Button size="lg" variant="outline" className="h-12 px-8 text-lg dark:text-slate-200 dark:border-slate-700">
                                Ver Planes
                            </Button>
                        </Link>
                    )}
                </div>
            </section>

            {/* Features Preview */}
            <section className="py-16 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
                    {[
                        { title: "Gestión de Miembros", desc: "Base de datos completa con historial y estado." },
                        { title: "Pagos Automatizados", desc: "Integración con Stripe para cobros recurrentes." },
                        { title: "Control de Acceso", desc: "Gestiona quién entra y quién sale en tiempo real." }
                    ].map((f, i) => (
                        <div key={i} className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <Check className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-4" />
                            <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{f.title}</h3>
                            <p className="text-slate-600 dark:text-slate-400">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
