"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/server/domain/entities/User";
import { Trash2, Shield, CheckCircle, XCircle, Eye, MoreHorizontal, UserCog, Calendar, Edit } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDeleteUser, useRestoreUser } from "@/hooks/users/use-users";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";

// --- HELPERS VISUALES ---

const getRoleConfig = (role: string) => {
    switch (role) {
        case "OWNER":
            return { label: "Propietario", style: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800" };
        case "ADMIN":
            return { label: "Admin", style: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800" };
        case "TRAINER":
            return { label: "Entrenador", style: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" };
        case "STAFF":
            return { label: "Staff", style: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700" };
        default:
            return { label: role, style: "bg-gray-100 text-gray-700 border-gray-200" };
    }
};

// --- COMPONENTES DE CELDA ---

const UserCell = ({ user }: { user: User }) => {
    const params = useParams();
    const slug = params.slug as string;
    const fullName = user.firstName ? `${user.firstName} ${user.lastName || ""}` : "Usuario";

    return (
        <div className="flex items-center gap-3 group">
            <Avatar className="h-9 w-9 border border-border/50 bg-background transition-transform group-hover:scale-105">
                <AvatarImage src={user.image || undefined} alt={fullName} />
                <AvatarFallback className="text-xs font-bold bg-linear-to-br from-indigo-500/10 to-cyan-500/10 text-indigo-600 dark:text-indigo-400">
                    {user.email.substring(0, 2).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
                <Link
                    href={`/${slug}/admin/users/${user.id}`}
                    className="font-medium text-sm text-foreground hover:text-primary transition-colors truncate max-w-[180px]"
                >
                    {fullName}
                </Link>
                <span className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                    {user.email}
                </span>
            </div>
        </div>
    );
};

const UserActions = ({ user }: { user: User }) => {
    const params = useParams();
    const slug = params.slug as string;
    const { mutate: deleteUser, isPending } = useDeleteUser();
    const { mutate: restoreUser } = useRestoreUser();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleDelete = () => {
        deleteUser(user.id, {
            onSuccess: () => {
                setShowDeleteDialog(false);
                toast.success("Usuario eliminado", {
                    action: {
                        label: "Deshacer",
                        onClick: () => restoreUser(user.id),
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
                            <Link href={`/${slug}/admin/users/${user.id}`} className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" /> Ver Perfil
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/${slug}/admin/users/${user.id}/edit`} className="cursor-pointer">
                                <Edit className="mr-2 h-4 w-4" /> Editar Usuario
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => setShowDeleteDialog(true)}
                            className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar Usuario
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-destructive flex items-center gap-2">
                            <Trash2 className="w-5 h-5" /> Eliminar Usuario
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará permanentemente al usuario
                            <span className="font-medium text-foreground">
                                {" "}{user.firstName || user.email}
                            </span>
                            . Perderá acceso inmediato al sistema.
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
            const { label, style } = getRoleConfig(role);

            return (
                <div className="flex items-center">
                    <Badge variant="outline" className={cn("gap-1.5 font-normal shadow-xs pl-1.5 pr-2.5", style)}>
                        <Shield className="w-3 h-3" />
                        {label}
                    </Badge>
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
                                : "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
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
        accessorKey: "createdAt",
        header: "Registro",
        cell: ({ row }) => {
            return (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5 opacity-70" />
                    <span className="font-primary">
                        {new Date(row.original.createdAt).toLocaleDateString("es-PE", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                        })}
                    </span>
                </div>
            );
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right">Acciones</div>,
        cell: ({ row }) => <UserActions user={row.original} />,
    },
];