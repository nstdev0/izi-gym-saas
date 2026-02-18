"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PlanResponse } from "@/shared/types/plans.types";
import { Trash2, Eye, CheckCircle, XCircle, MoreHorizontal, Crown, Clock, CreditCard, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useDeletePlan, useRestorePlan } from "@/hooks/plans/use-plans";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";

// --- HELPERS ---
function formatMoney(amount: number) {
    return new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: "PEN",
    }).format(amount);
}

const getDurationLabel = (days: number) => {
    if (days === 30) return "Mensual";
    if (days === 90) return "Trimestral";
    if (days === 180) return "Semestral";
    if (days === 365) return "Anual";
    return `${days} días`;
};

// --- COMPONENTES DE CELDA ---

const PlanNameCell = ({ plan }: { plan: PlanResponse }) => {
    const params = useParams();
    const slug = params.slug as string;

    return (
        <div className="flex items-center gap-3 group">
            {/* Icono del Plan */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-linear-to-br from-purple-500/10 to-blue-500/10 text-purple-600 dark:text-purple-400">
                <Crown className="h-4 w-4" />
            </div>

            <div className="flex flex-col">
                <Link
                    href={`/${slug}/admin/plans/${plan.id}`}
                    className="font-medium text-sm text-foreground hover:text-primary transition-colors"
                >
                    {plan.name}
                </Link>
                {plan.description ? (
                    <span className="text-[10px] text-muted-foreground line-clamp-1 max-w-[200px]">
                        {plan.description}
                    </span>
                ) : (
                    <span className="text-[10px] text-muted-foreground italic">Sin descripción</span>
                )}
            </div>
        </div>
    );
};

const PlanActions = ({ plan }: { plan: PlanResponse }) => {
    const params = useParams();
    const slug = params.slug as string;
    const { mutate: deletePlan, isPending } = useDeletePlan();
    const { mutate: restorePlan } = useRestorePlan();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleDelete = () => {
        deletePlan(plan.id, {
            onSuccess: () => {
                setShowDeleteDialog(false);
                toast.success("Plan eliminado", {
                    action: {
                        label: "Deshacer",
                        onClick: () => restorePlan(plan.id),
                    },
                });
            },
        });
    };

    return (
        <>
            <div className="flex justify-end">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={`/${slug}/admin/plans/${plan.id}`} className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/${slug}/admin/plans/${plan.id}/edit`} className="cursor-pointer">
                                <Edit className="mr-2 h-4 w-4" /> Editar Plan
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => setShowDeleteDialog(true)}
                            className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar Plan
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-destructive flex items-center gap-2">
                            <Trash2 className="w-5 h-5" /> Eliminar Plan
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará el plan <span className="font-medium text-foreground">"{plan.name}"</span>.
                            Las membresías existentes asociadas a este plan podrían verse afectadas visualmente, aunque conservarán sus datos históricos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            disabled={isPending}
                        >
                            {isPending ? "Eliminando..." : "Eliminar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

// --- DEFINICIÓN DE COLUMNAS ---
export const columns: ColumnDef<PlanResponse>[] = [
    {
        accessorKey: "name",
        header: "Detalles del Plan",
        cell: ({ row }) => <PlanNameCell plan={row.original} />,
    },
    {
        accessorKey: "durationDays",
        header: "Duración",
        cell: ({ row }) => {
            const days = row.getValue("durationDays") as number;
            return (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-3.5 h-3.5 opacity-70" />
                    <span className="font-medium text-foreground">{getDurationLabel(days)}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "price",
        header: () => <div className="text-right">Precio</div>,
        cell: ({ row }) => {
            const price = row.getValue("price") as number;
            return (
                <div className="text-right font-primary font-medium text-foreground">
                    {formatMoney(price)}
                </div>
            );
        },
    },
    {
        accessorKey: "isActive",
        header: () => <div className="text-center">Estado</div>,
        cell: ({ row }) => {
            const isActive = row.original.isActive;
            return (
                <div className="flex justify-center">
                    <Badge
                        variant="outline"
                        className={cn(
                            "gap-1.5 pl-1.5 pr-2.5 py-0.5 shadow-xs transition-colors",
                            isActive
                                ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                                : "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700"
                        )}
                    >
                        {isActive ? (
                            <>
                                <CheckCircle className="w-3 h-3" /> Activo
                            </>
                        ) : (
                            <>
                                <XCircle className="w-3 h-3" /> Inactivo
                            </>
                        )}
                    </Badge>
                </div>
            );
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right">Acciones</div>,
        cell: ({ row }) => <PlanActions plan={row.original} />,
    },
];