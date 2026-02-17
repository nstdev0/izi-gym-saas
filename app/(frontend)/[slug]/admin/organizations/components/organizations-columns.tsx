"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Organization } from "@/shared/types/organizations.types";
import { Edit, Trash2, Building2 } from "lucide-react";
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
import { useDeleteOrganization } from "@/hooks/organizations/use-organizations";
import { toast } from "sonner";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

// Component for the Name cell
const NameCell = ({ organization }: { organization: Organization }) => {
    const params = useParams();
    const slug = params.slug as string;

    return (
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                {organization.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={organization.image}
                        alt={organization.name}
                        className="w-full h-full object-cover rounded-lg"
                    />
                ) : (
                    <Building2 className="w-4 h-4 text-primary" />
                )}
            </div>
            <div>
                <Link
                    href={`/${slug}/admin/organizations/${organization.id}/edit`}
                    className="font-medium text-foreground hover:underline"
                >
                    {organization.name}
                </Link>
            </div>
        </div>
    );
};

// Component for Actions
const OrganizationActions = ({ organization }: { organization: Organization }) => {
    const params = useParams();
    const slug = params.slug as string;
    const { mutate: deleteOrganization, isPending } = useDeleteOrganization();
    const [open, setOpen] = useState(false);

    const handleDelete = () => {
        deleteOrganization(organization.id, {
            onSuccess: () => {
                setOpen(false);
                toast.success("Organización eliminada");
            },
        });
    };

    return (
        <div className="flex justify-center gap-2">
            <Link href={`/${slug}/admin/organizations/${organization.id}/edit`}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Edit className="w-4 h-4" />
                </Button>
            </Link>

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
                            Esta acción no se puede deshacer. Esto eliminará permanentemente la organización
                            <span className="font-medium text-foreground">
                                {" "}
                                {organization.name}
                            </span>{" "}
                            y todos sus datos asociados.
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

export const columns: ColumnDef<Organization>[] = [
    {
        accessorKey: "name",
        header: "Nombre",
        cell: ({ row }) => <NameCell organization={row.original} />,
    },
    {
        accessorKey: "slug",
        header: "Slug",
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.slug}</span>,
    },
    {
        accessorKey: "isActive",
        header: "Estado",
        cell: ({ row }) => {
            const isActive = row.original.isActive;
            return (
                <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-green-500 hover:bg-green-600" : ""}>
                    {isActive ? "Activo" : "Inactivo"}
                </Badge>
            );
        },
    },
    {
        id: "actions",
        header: () => <div className="text-center">Acciones</div>,
        cell: ({ row }) => <OrganizationActions organization={row.original} />,
    },
];
