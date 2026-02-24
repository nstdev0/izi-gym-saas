"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function OnboardingPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { orgId, isLoaded, orgSlug } = useAuth();
    const [error, setError] = useState<string | null>(null);

    const planSlug = searchParams.get("plan");

    useEffect(() => {
        if (!isLoaded) return;

        if (!orgSlug || !orgId) {
            return;
        }
        if (!planSlug || planSlug === "free-trial") {
            router.push(`/${orgSlug}/admin/dashboard`);
            return;
        }

        const initCheckout = async () => {
            try {
                const response = await fetch(`/api/checkout`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        planId: planSlug
                    })
                });

                const data = await response.json();

                if (response.ok && data.url) {
                    window.location.href = data.url;
                } else {
                    console.error("Error iniciando checkout:", data);
                    setError("No se pudo iniciar el pago. Redirigiendo...");
                    setTimeout(() => router.push(`/${orgSlug}/admin/dashboard`), 2000);
                }
            } catch (err) {
                console.error(err);
                setError("Ocurrió un error. Redirigiendo...");
                setTimeout(() => router.push(`/${orgSlug}/admin/dashboard`), 2000);
            }
        };

        initCheckout();

    }, [isLoaded, orgId, orgSlug, planSlug, router]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-slate-950 p-4 text-center">
            <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <h1 className="text-2xl font-bold tracking-tight">Preparando tu entorno</h1>
                <p className="text-muted-foreground">
                    {error || "Por favor espera mientras configuramos tu cuenta y suscripción..."}
                </p>
            </div>
        </div>
    );
}