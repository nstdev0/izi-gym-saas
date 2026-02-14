"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

export default function OnboardingPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { orgId, isLoaded, orgSlug } = useAuth();

    const planSlug = searchParams.get("plan");

    useEffect(() => {
        if (!isLoaded) return;

        if (!orgSlug) {
            router.push(`/`);
            return;
        }

        // Si hay una organización cargada, ejecutamos el upgrade
        if (orgId) {
            const upgradePlan = async () => {
                try {
                    const response = await fetch(`/api/system/organizations/upgrade-plan/`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            plan: planSlug
                        })
                    });

                    if (response.ok) {
                        if (orgSlug === "free-trial") return
                        toast.success("Plan actualizado correctamente");
                    } else {
                        console.error("Error actualizando plan inicial");
                    }
                } catch (error) {
                    console.error(error);
                } finally {
                    // Pase lo que pase, no dejamos al usuario atrapado aquí
                    router.push(`/${orgSlug}/admin/dashboard`);
                }
            };

            upgradePlan();
        }
    }, [isLoaded, orgId, planSlug, router]);

    return (
        <div className="flex h-screen w-full items-center justify-center flex-col gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Configurando tu gimnasio...</p>
        </div>
    );
}