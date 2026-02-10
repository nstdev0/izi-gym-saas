"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Plan } from "@/server/domain/entities/Plan";
import { Edit, Trash2, Eye, CheckCircle, XCircle } from "lucide-react";
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
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useDeletePlan } from "@/hooks/plans/use-plans";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

const PlanNameCell = ({ plan }: { plan: Plan }) => {
    const params = useParams();
    const slug = params.slug as string;
    return (
        <div className="flex flex-col">
            <Link
                href={`/${slug}/admin/plans/${plan.id}`}
                className="font-medium text-foreground hover:underline"
            >
                {plan.name}
            </Link>
            {plan.description && (
                <span className="text-sm text-muted-foreground line-clamp-1">
                    {plan.description}
                </span>
            )}
        </div>
    );
};

const PlanActions = ({ plan }: { plan: Plan }) => {
    const params = useParams();
    const slug = params.slug as string;
    const { mutate: deletePlan, isPending } = useDeletePlan();
    const [open, setOpen] = useState(false);

    const handleDelete = () => {
        deletePlan(plan.id, {
            onSuccess: () => {
                setOpen(false);
            },
        });
    };

    return (
        <div className="flex justify-center">
            <Link href={`/${slug}/admin/plans/${plan.id}`}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Eye className="w-4 h-4" />
                </Button>
            </Link>
            {/* <Link href={`/${slug}/admin/plans/${plan.id}/edit`}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Edit className="w-4 h-4" />
                </Button>
            </Link> */}
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el
                            plan
                            <span className="font-medium text-foreground">
                                {" "}
                                {plan.name}
                            </span>{" "}
                            y puede afectar a las membresías asociadas.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
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
        </div>
    );
};

export const columns: ColumnDef<Plan>[] = [
    {
        accessorKey: "name",
        header: "Plan",
        cell: ({ row }) => <PlanNameCell plan={row.original} />,
    },
    {
        accessorKey: "price",
        header: "Precio",
        cell: ({ row }) => {
            const price = row.getValue("price") as number;
            return <div className="font-medium">${formatCurrency(price)}</div>;
        },
    },
    {
        accessorKey: "durationDays",
        header: "Duración",
        cell: ({ row }) => {
            const days = row.getValue("durationDays") as number;
            return (
                <div className="text-muted-foreground">
                    {days === 30 ? "1 mes" : days === 365 ? "1 año" : `${days} días`}
                </div>
            );
        },
    },
    {
        accessorKey: "isActive",
        header: "Estado",
        cell: ({ row }) => {
            const isActive = row.original.isActive;
            return (
                <Badge
                    variant={isActive ? "default" : "secondary"}
                    className={`gap-1 ${isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                >
                    {isActive ? (
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
            );
        },
    },
    {
        id: "actions",
        header: () => <div className="text-center">Acciones</div>,
        cell: ({ row }) => <PlanActions plan={row.original} />,
    },
];
