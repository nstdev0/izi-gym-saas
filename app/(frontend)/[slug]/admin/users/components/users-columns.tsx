"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/server/domain/entities/User";
import { Trash2, Shield, CheckCircle, XCircle, Eye } from "lucide-react";
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
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { useDeleteUser } from "@/hooks/users/use-users";
import { useState } from "react";

const UserCell = ({ user }: { user: User }) => {
    const params = useParams();
    const slug = params.slug as string;

    return (
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {user.image ? (
                    <Image
                        src={user.image}
                        alt={user.email}
                        width={32}
                        height={32}
                        className="rounded-full object-cover w-full h-full"
                    />
                ) : (
                    <div className="text-xs font-medium text-primary uppercase">
                        {user.email.substring(0, 2)}
                    </div>
                )}
            </div>
            <div className="flex flex-col">
                <span className="font-medium text-foreground">
                    {user.firstName ? `${user.firstName} ${user.lastName || ""}` : "Sin nombre"}
                </span>
                <Link
                    href={`/${slug}/admin/users/${user.id}`}
                    className="text-sm text-muted-foreground hover:underline"
                >
                    {user.email}
                </Link>
            </div>
        </div>
    );
};

const UserActions = ({ user }: { user: User }) => {
    const params = useParams();
    const slug = params.slug as string;
    const { mutate: deleteUser, isPending } = useDeleteUser();
    const [open, setOpen] = useState(false);

    const handleDelete = () => {
        deleteUser(user.id, {
            onSuccess: () => {
                setOpen(false);
            },
        });
    };

    return (
        <div className="flex justify-center">
            <Link href={`/${slug}/admin/users/${user.id}`}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Eye className="w-4 h-4" />
                </Button>
            </Link>
            {/* <Link href={`/${slug}/admin/users/${user.id}/edit`}>
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
                            Esta acción no se puede deshacer. Esto eliminará permanentemente al
                            usuario
                            <span className="font-medium text-foreground">
                                {" "}
                                {user.firstName} {user.lastName}
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

export const columns: ColumnDef<User>[] = [
    {
        accessorKey: "user",
        header: "Usuario",
        cell: ({ row }) => <UserCell user={row.original} />,
    },
    {
        accessorKey: "role",
        header: "Rol",
        cell: ({ row }) => {
            const role = row.getValue("role") as string;

            const roleColors: Record<string, string> = {
                OWNER: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
                ADMIN: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
                STAFF: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
                TRAINER: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
            };

            return (
                <Badge variant="outline" className={`border-0 ${roleColors[role] || ""}`}>
                    <Shield className="w-3 h-3 mr-1" />
                    {role}
                </Badge>
            );
        },
    },
    {
        accessorKey: "isActive",
        header: "Estado",
        cell: ({ row }) => {
            const isActive = row.original.isActive;
            return (
                <div className={`flex items-center gap-1.5 text-sm ${isActive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {isActive ? (
                        <>
                            <CheckCircle className="w-4 h-4" />
                            <span>Activo</span>
                        </>
                    ) : (
                        <>
                            <XCircle className="w-4 h-4" />
                            <span>Inactivo</span>
                        </>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "createdAt",
        header: "Fecha registro",
        cell: ({ row }) => {
            return (
                <div className="text-muted-foreground text-sm">
                    {new Date(row.original.createdAt).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    })}
                </div>
            );
        },
    },
    {
        id: "actions",
        header: () => <div className="text-center">Acciones</div>,
        cell: ({ row }) => <UserActions user={row.original} />,
    },
];
