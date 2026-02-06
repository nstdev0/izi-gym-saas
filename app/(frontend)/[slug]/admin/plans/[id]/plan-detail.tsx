"use client";

import { Plan } from "@/server/domain/entities/Plan";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Calendar, DollarSign, FileText } from "lucide-react";

interface PlanDetailProps {
    plan: Plan;
}

export default function PlanDetail({ plan }: PlanDetailProps) {
    const formatDuration = (days: number) => {
        if (days === 1) return "1 día";
        if (days === 7) return "1 semana";
        if (days === 30) return "1 mes";
        if (days === 90) return "3 meses";
        if (days === 180) return "6 meses";
        if (days === 365) return "1 año";
        return `${days} días`;
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Información General
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Nombre del Plan</p>
                        <p className="text-lg font-medium">{plan.name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Descripción</p>
                        <p className="text-foreground">
                            {plan.description || "Sin descripción"}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Estado</p>
                        <Badge
                            variant={plan.isActive ? "default" : "secondary"}
                            className={`gap-1 mt-1 ${plan.isActive
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                                }`}
                        >
                            {plan.isActive ? (
                                <>
                                    <CheckCircle className="w-3 h-3" />
                                    Activo
                                </>
                            ) : (
                                <>
                                    <XCircle className="w-3 h-3" />
                                    Inactivo
                                </>
                            )}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        Detalles del Plan
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Precio</p>
                        <p className="text-2xl font-bold text-primary">
                            ${plan.price.toLocaleString("es-CO")}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Duración</p>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <p className="text-lg font-medium">{formatDuration(plan.durationDays)}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Precio por día</p>
                        <p className="text-foreground">
                            ${(plan.price / plan.durationDays).toFixed(2)}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Información del Sistema</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div>
                        <p className="text-sm text-muted-foreground">ID del Plan</p>
                        <p className="text-sm font-mono">{plan.id}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Fecha de Creación</p>
                        <p className="text-foreground">
                            {new Date(plan.createdAt).toLocaleDateString("es-ES", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                            })}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Última Actualización</p>
                        <p className="text-foreground">
                            {new Date(plan.updatedAt).toLocaleDateString("es-ES", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                            })}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
