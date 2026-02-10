"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, User, FileText, Clock } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface MembershipDetailProps {
    membership: {
        id: string;
        startDate: Date;
        endDate: Date;
        status: string;
        pricePaid: number;
        memberId: string;
        planId: string;
        member?: { firstName: string; lastName: string };
        plan?: { name: string };
        createdAt: Date;
        updatedAt: Date;
    };
}

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    ACTIVE: "default",
    PENDING: "secondary",
    EXPIRED: "destructive",
    CANCELLED: "outline",
};

const statusLabels: Record<string, string> = {
    ACTIVE: "Activa",
    PENDING: "Pendiente",
    EXPIRED: "Vencida",
    CANCELLED: "Cancelada",
};

function getDaysRemaining(endDate: Date | string): number {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function MembershipDetail({ membership }: MembershipDetailProps) {
    const daysRemaining = getDaysRemaining(membership.endDate);

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Información del Miembro
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Nombre</p>
                        <p className="font-medium">
                            {membership.member
                                ? `${membership.member.firstName} ${membership.member.lastName}`
                                : "N/A"}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Plan
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Plan Asignado</p>
                        <p className="font-medium">{membership.plan?.name || "N/A"}</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Fechas
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Inicio</p>
                            <p className="font-medium">{formatDate(membership.startDate)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Vencimiento</p>
                            <p className="font-medium">{formatDate(membership.endDate)}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Días Restantes</p>
                        <p className={`font-bold text-lg ${daysRemaining <= 7 ? "text-destructive" : daysRemaining <= 15 ? "text-yellow-600" : "text-green-600"}`}>
                            {daysRemaining > 0 ? `${daysRemaining} días` : "Vencida"}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Pago y Estado
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Precio Pagado</p>
                            <p className="font-bold text-lg">{formatCurrency(membership.pricePaid)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Estado</p>
                            <Badge variant={statusVariants[membership.status] || "outline"} className="mt-1">
                                {statusLabels[membership.status] || membership.status}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Información del Sistema
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:-grid-cols-1 md:grid-cols-1 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">ID</p>
                            <p className="font-mono">{membership.id}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Creado</p>
                            <p>{formatDate(membership.createdAt)}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Actualizado</p>
                            <p>{formatDate(membership.updatedAt)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
