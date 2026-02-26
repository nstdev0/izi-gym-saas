"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";

interface ManageBillingButtonProps {
    variant?: "default" | "secondary" | "outline" | "ghost";
    size?: "default" | "sm" | "lg" | "icon";
    className?: string;
    label?: string;
}

export function ManageBillingButton({
    variant = "outline",
    size = "sm",
    className = "",
    label = "Gestionar Suscripción",
}: ManageBillingButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/billing/portal", {
                method: "POST",
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("[Billing Portal]", data.message);
                // Could show a toast here
                return;
            }

            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error("[Billing Portal] Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            className={className}
            onClick={handleClick}
            disabled={isLoading}
        >
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
                <CreditCard className="h-4 w-4 mr-2" />
            )}
            {label}
        </Button>
    );
}
