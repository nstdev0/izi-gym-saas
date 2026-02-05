"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/server/domain/entities/User";
import { MoreHorizontal, Edit, Trash2, Shield, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { toast } from "sonner";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<User>[] = [
    {
        accessorKey: "user",
        header: "Usuario",
        cell: ({ row }) => {
            const user = row.original;
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
        },
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
        header: () => <div className="text-right">Acciones</div>,
        cell: ({ row }) => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const params = useParams();
            const slug = params.slug as string;
            const user = row.original;

            return (
                <div className="flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menú</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link href={`/${slug}/admin/users/${user.id}`}>
                                    Ver detalle
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/${slug}/admin/users/${user.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" /> Editar
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-600">
                                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta acción no se puede deshacer. Esto eliminará permanentemente la cuenta del usuario
                                            <span className="font-bold"> {user.email}</span>.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                            className="bg-red-600 focus:ring-red-600"
                                            onClick={async () => {
                                                try {
                                                    await api.delete(`/api/users/${user.id}`);
                                                    toast.success("Usuario eliminado correctamente");
                                                    // Force refresh logic could be handled via context or router refresh, 
                                                    // but window.location.reload is sure-fire for now as in members-columns.
                                                    window.location.reload();
                                                } catch (error) {
                                                    if (error instanceof ApiError) {
                                                        toast.error(error.message);
                                                    } else {
                                                        toast.error("Error al eliminar usuario");
                                                    }
                                                }
                                            }}
                                        >
                                            Eliminar
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];
