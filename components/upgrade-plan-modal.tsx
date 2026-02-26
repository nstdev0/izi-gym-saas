"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { PricingCards } from "./pricing-cards";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner"; // 🟢 Agregado para feedback de errores

interface UpgradePlanModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function UpgradePlanModal({ isOpen, onOpenChange }: UpgradePlanModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleSelectPlan = async (planSlug: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/checkout`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId: planSlug }),
            });

            const data = await response.json();

            if (response.ok && data.url) {
                window.location.href = data.url;
            } else {
                console.error("Error iniciando checkout:", data);
                toast.error(data.error || "Hubo un problema al procesar tu solicitud.");
                setIsLoading(false);
            }
        } catch (error) {
            console.error(error);
            toast.error("Ocurrió un error inesperado. Revisa tu conexión.");
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            // Evitamos que el usuario cierre el modal accidentalmente mientras carga
            if (!isLoading) onOpenChange(open);
        }}>
            {/* 🟢 Agregado overflow-y-auto y max-h para que no se rompa en móviles */}
            <DialogContent className="max-w-5xl p-0 overflow-y-auto max-h-[90vh] bg-background">
                <div className="p-6 md:p-8">
                    <DialogHeader className="mb-8">
                        <DialogTitle className="text-3xl font-bold text-center">Actualiza tu Plan</DialogTitle>
                        <DialogDescription className="text-center text-lg mt-2">
                            Desbloquea todo el potencial de tu gimnasio con nuestros planes premium.
                        </DialogDescription>
                    </DialogHeader>

                    {isLoading ? (
                        <div className="flex py-12 flex-col items-center justify-center space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-muted-foreground font-medium">Redirigiendo a pago seguro...</p>
                        </div>
                    ) : (
                        <PricingCards onSelectPlan={handleSelectPlan} />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}