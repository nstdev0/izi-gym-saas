"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PricingCardsProps {
    onSelectPlan: (planSlug: string) => void;
}

export function PricingCards({ onSelectPlan }: PricingCardsProps) {
    const [isYearly, setIsYearly] = useState(false);

    const plans = [
        {
            name: "Prueba gratis",
            description: "Para gimnasios pequeños y recién empezando.",
            monthlySlug: "free-trial",
            // 🟢 No necesitamos yearlySlug aquí, lo manejaremos lógicamente abajo
            priceMonthly: "$0",
            features: ["Hasta 50 miembros", "Gestión de asistencias", "Soporte básico"],
            popular: false,
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
        }
    ];

    return (
        <div className="w-full">
            <div className="flex items-center justify-center gap-3 mb-8">
                <Label htmlFor="billing-cycle" className={!isYearly ? "font-bold" : "text-muted-foreground"}>
                    Mensual
                </Label>
                <Switch
                    id="billing-cycle"
                    checked={isYearly}
                    onCheckedChange={setIsYearly}
                />
                <Label htmlFor="billing-cycle" className={isYearly ? "font-bold" : "text-muted-foreground"}>
                    Anual <span className="text-green-500 font-medium ml-1">(Ahorra ~20%)</span>
                </Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => {
                    // 🟢 FIX CRÍTICO: Si no tiene yearlySlug (como el Free), forzamos la data mensual.
                    const isFreePlan = plan.monthlySlug === "free-trial";
                    const slug = (isYearly && plan.yearlySlug) ? plan.yearlySlug : plan.monthlySlug;
                    const price = (isYearly && plan.priceYearly) ? plan.priceYearly : plan.priceMonthly;
                    const cycleText = isFreePlan ? 'siempre' : (isYearly ? 'año' : 'mes');

                    return (
                        <div key={plan.name} className={`relative flex flex-col rounded-xl border bg-card text-card-foreground shadow ${plan.popular ? 'border-primary ring-2 ring-primary' : ''}`}>
                            {plan.popular && (
                                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-1/2">
                                    <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                        Popular
                                    </span>
                                </div>
                            )}
                            <div className="p-6 flex flex-col space-y-1.5">
                                <h3 className="font-semibold leading-none tracking-tight text-2xl">{plan.name}</h3>
                                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                            </div>
                            <div className="p-6 pt-0 grow">
                                <div className="mb-6 flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold">{price}</span>
                                    <span className="text-muted-foreground font-medium">/{cycleText}</span>
                                </div>
                                <ul className="space-y-3">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                                                <Check className="h-3 w-3 text-primary shrink-0" />
                                            </div>
                                            <span className="text-sm font-medium">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="p-6 pt-0 mt-auto">
                                <Button
                                    className="w-full font-semibold"
                                    variant={plan.popular ? "default" : "outline"}
                                    onClick={() => onSelectPlan(slug)}
                                >
                                    Elegir {plan.name}
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}