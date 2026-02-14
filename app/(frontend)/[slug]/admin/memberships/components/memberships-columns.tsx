"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useDeleteMembership } from "@/hooks/memberships/use-memberships";
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

import { useParams } from "next/navigation";

// ... existing imports ...

function ActionsCell({ membership }: { membership: MembershipWithRelations }) {
    const params = useParams();
    const slug = params.slug as string;
    const { mutate: deleteMembership, isPending } = useDeleteMembership();
    const [open, setOpen] = useState(false);

    const handleDelete = () => {
        deleteMembership(membership.id, {
            onSuccess: () => {
                setOpen(false);
            },
        });
    };

    return (
        <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" asChild>
                <Link href={`/${slug}/admin/memberships/${membership.id}`}>
                    <Eye className="h-4 w-4" />
                </Link>
            </Button>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar membresía?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente esta membresía.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            className="bg-destructive hover:bg-destructive/90"
                            disabled={isPending}
                        >
                            {isPending ? "Eliminando..." : "Eliminar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export const columns: ColumnDef<MembershipWithRelations>[] = [
    {
        accessorKey: "member",
        header: "Miembro",
        cell: ({ row }) => {
            const member = row.original.member;
            return member ? `${member.firstName} ${member.lastName}` : "N/A";
        },
    },
    {
        accessorKey: "plan",
        header: "Plan",
        cell: ({ row }) => {
            const plan = row.original.plan;
            return plan?.name || "N/A";
        },
    },
    {
        accessorKey: "startDate",
        header: "Inicio",
        cell: ({ row }) => formatDate(row.original.startDate),
    },
    {
        accessorKey: "endDate",
        header: "Vencimiento",
        cell: ({ row }) => formatDate(row.original.endDate),
    },
    {
        accessorKey: "pricePaid",
        header: "Precio",
        cell: ({ row }) => formatCurrency(row.original.pricePaid),
    },
    {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => {
            const status = row.original.status;
            return (
                <Badge variant={statusVariants[status] || "outline"}>
                    {statusLabels[status] || status}
                </Badge>
            );
        },
    },
    {
        id: "actions",
        header: () => <div className="text-center">Acciones</div>,
        cell: ({ row }) => <ActionsCell membership={row.original} />,
    },
];
