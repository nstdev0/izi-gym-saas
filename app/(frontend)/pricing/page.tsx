"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check } from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";

function PricingCard({
    planId,
    price,
    features,
    buttonText,
    isFree,
}: {
    planId: string;
    price: number | string;
    features: string[];
    buttonText?: string;
    isFree?: boolean;
}) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { userId } = useAuth();

    const handleSubscribe = async () => {
        if (!userId) {
            // Direct Sign-up flow (Clerk will handle org creation after)
            router.push("/sign-up");
        } else {
            // If logged in, go to root to trigger dashboard/org redirection
            router.push("/");
        }
    };

    return (
        <div className="border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-900 flex flex-col">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{planId === "free-trial" ? "Prueba Gratis" : "Plan Pro"}</h3>
            <div className="mt-4 flex items-baseline text-slate-900 dark:text-white">
                <span className="text-4xl font-extrabold tracking-tight">{typeof price === 'number' ? `$${price}` : price}</span>
                {typeof price === 'number' && <span className="ml-1 text-xl font-semibold text-slate-500 dark:text-slate-400">/mes</span>}
            </div>
            <p className="mt-6 text-slate-500 dark:text-slate-400">
                Todo lo que necesitas para escalar tu gimnasio.
            </p>

            <ul className="mt-6 space-y-4 flex-1">
                {features.map((feature) => (
                    <li key={feature} className="flex">
                        <Check className="flex-shrink-0 w-6 h-6 text-green-500" />
                        <span className="ml-3 text-slate-500 dark:text-slate-300">{feature}</span>
                    </li>
                ))}
            </ul>

            <Button
                onClick={handleSubscribe}
                disabled={loading}
                className={`mt-8 w-full text-white ${isFree
                    ? "bg-slate-600 hover:bg-slate-500 dark:bg-slate-700 dark:hover:bg-slate-600"
                    : "bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700"}`}
            >
                {loading ? "Procesando..." : (buttonText || "Contratar Ahora")}
            </Button>
        </div>
    );
}

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Navbar Reuse */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/">
                        <div className="text-xl font-bold text-slate-900 dark:text-white">IziGym</div>
                    </Link>
                    <div className="flex gap-4 items-center">
                        <Link href="/sign-in">
                            <Button variant="ghost" className="dark:text-slate-300">Iniciar Sesión</Button>
                        </Link>
                        <ModeToggle />
                    </div>
                </div>
            </header>

            <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
                        Planes Simples y Transparentes
                    </h2>
                    <p className="mt-4 text-xl text-slate-600 dark:text-slate-400">
                        Sin comisiones ocultas. Cancela cuando quieras.
                    </p>
                </div>

                <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:gap-12 max-w-4xl mx-auto">
                    <PricingCard
                        planId="free-trial"
                        price="Gratis"
                        isFree={true}
                        buttonText="Comenzar Prueba"
                        features={[
                            "Hasta 50 Miembros",
                            "Panel Básico",
                            "Soporte por Email",
                            "2 Staff Members",
                        ]}
                    />
                    <PricingCard
                        planId="pro-monthly"
                        price={29}
                        features={[
                            "Miembros Ilimitados",
                            "Panel Administrativo Completo",
                            "Soporte Prioritario 24/7",
                            "Exportación de Datos",
                            "Gestión de Staff",
                        ]}
                    />
                </div>
            </div>
        </div>
    );
}
