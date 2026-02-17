"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, X, Ban, CreditCard, CalendarDays, User, MoreHorizontal, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useCancelMembership, useDeleteMembership, useRestoreMembership } from "@/hooks/memberships/use-memberships";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// --- TIPOS ---
interface MembershipWithRelations {
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
}

// --- HELPERS VISUALES ---
const getStatusStyles = (status: string) => {
    switch (status) {
        case "ACTIVE":
            return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
        case "PENDING":
            return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
        case "EXPIRED":
            return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
        case "CANCELLED":
            return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
        default:
            return "bg-gray-100 text-gray-700 border-gray-200";
    }
};

const statusLabels: Record<string, string> = {
    ACTIVE: "Activa",
    PENDING: "Pendiente",
    EXPIRED: "Vencida",
    CANCELLED: "Cancelada",
};

function formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: "PEN",
    }).format(amount);
}

// --- COMPONENTE DE ACCIONES (LÓGICA + UI) ---
const MembershipActions = ({ membership }: { membership: MembershipWithRelations }) => {
    const params = useParams();
    const slug = params.slug?.toString();

    // Estados separados para evitar conflictos de apertura
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const { mutate: deleteMembership, isPending: isDeletePending } = useDeleteMembership();
    const { mutate: restoreMembership, isPending: isRestorePending } = useRestoreMembership();
    const { mutate: cancelMembership, isPending: isCancelPending } = useCancelMembership();

    const handleDelete = () => {
        deleteMembership(membership.id, {
            onSuccess: () => {
                setShowDeleteDialog(false);
                toast.success("Membresía eliminada", {
                    action: {
                        label: "Deshacer",
                        onClick: () => restoreMembership(membership.id),
                    },
                });
            },
        });
    };

    const handleCancel = () => {
        cancelMembership(membership.id, {
            onSuccess: () => {
                setShowCancelDialog(false);
                toast.success("Membresía cancelada", {
                    action: {
                        label: "Deshacer",
                        onClick: () => restoreMembership(membership.id),
                    },
                });
            },
        });
    };

    return (
        <div className="flex items-center justify-end gap-1">
            {/* Ver Detalle */}
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-50" asChild>
                <Link href={`/${slug}/admin/memberships/${membership.id}`}>
                    <Eye className="h-4 w-4" />
                </Link>
            </Button>

            {/* Menú de Acciones Peligrosas */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => setShowCancelDialog(true)}
                        disabled={membership.status === 'CANCELLED' || membership.status === 'EXPIRED'}
                        className="text-amber-600 focus:text-amber-700 focus:bg-amber-50"
                    >
                        <Ban className="mr-2 h-4 w-4" /> Cancelar Membresía
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-red-600 focus:text-red-700 focus:bg-red-50"
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar Registro
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* DIALOGO CANCELAR */}
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
                            <AlertCircle className="h-5 w-5" />
                            ¿Cancelar membresía?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción marcará la membresía como cancelada. El usuario perderá acceso inmediato.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isCancelPending}>Volver</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleCancel();
                            }}
                            className="bg-amber-600 hover:bg-amber-700"
                            disabled={isCancelPending}
                        >
                            {isCancelPending ? "Cancelando..." : "Confirmar Cancelación"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* DIALOGO ELIMINAR */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="h-5 w-5" />
                            ¿Eliminar permanentemente?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará el registro de la base de datos. Se recomienda cancelar en lugar de eliminar para mantener el historial.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeletePending}>Volver</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            className="bg-destructive hover:bg-destructive/90"
                            disabled={isDeletePending}
                        >
                            {isDeletePending ? "Eliminando..." : "Eliminar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

// --- DEFINICIÓN DE COLUMNAS ---
export const columns: ColumnDef<MembershipWithRelations>[] = [
    {
        accessorKey: "member",
        header: "Miembro",
        cell: ({ row }) => {
            const member = row.original.member;
            if (!member) return <span className="text-muted-foreground italic">Desconocido</span>;

            return (
                <div className="flex items-center gap-3 group">
                    <Avatar className="h-9 w-9 border border-border/50 bg-background">
                        <AvatarFallback className="text-xs font-bold bg-linear-to-br from-blue-500/10 to-purple-500/10 text-primary">
                            {member.firstName[0]}{member.lastName[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium text-sm group-hover:text-primary transition-colors">
                            {member.firstName} {member.lastName}
                        </span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "plan",
        header: "Plan",
        cell: ({ row }) => {
            const plan = row.original.plan;
            return (
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                        <CreditCard className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-medium text-sm text-muted-foreground">
                        {plan?.name || "N/A"}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "startDate",
        header: "Vigencia",
        cell: ({ row }) => (
            <div className="flex flex-col text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="w-12">Desde:</span>
                    <span className="font-primary text-foreground font-medium">{formatDate(row.original.startDate)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground mt-0.5">
                    <span className="w-12">Hasta:</span>
                    <span className={cn(
                        "font-primary font-medium",
                        new Date(row.original.endDate) < new Date() && row.original.status === 'ACTIVE'
                            ? "text-red-500 font-bold"
                            : "text-foreground"
                    )}>
                        {formatDate(row.original.endDate)}
                    </span>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "pricePaid",
        header: () => <div className="text-right">Precio</div>,
        cell: ({ row }) => (
            <div className="text-right font-primary font-medium text-foreground">
                {formatCurrency(row.original.pricePaid)}
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: () => <div className="text-center">Estado</div>,
        cell: ({ row }) => {
            const status = row.original.status;
            return (
                <div className="flex justify-center">
                    <Badge variant="outline" className={cn("capitalize shadow-xs", getStatusStyles(status))}>
                        {statusLabels[status] || status.toLowerCase()}
                    </Badge>
                </div>
            );
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right">Acciones</div>,
        cell: ({ row }) => <MembershipActions membership={row.original} />,
    },
];