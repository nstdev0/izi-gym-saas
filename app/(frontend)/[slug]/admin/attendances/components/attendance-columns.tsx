"use client";

import { ColumnDef } from "@tanstack/react-table";
import { QrCode, Hand, CalendarDays, Eye, Trash2, MoreHorizontal, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useDeleteAttendance } from "@/hooks/attendance/use-attendance";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AttendanceResponse } from "@/shared/types/attendance.types";

// --- HELPERS VISUALES ---
const getMethodStyles = (method: string) => {
    if (method === "QR") {
        return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
    }
    return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
};

// --- COMPONENTES DE CELDA ---

const MemberCell = ({ attendance }: { attendance: AttendanceResponse }) => {
    const params = useParams();
    const slug = params.slug as string;
    const member = attendance.member;

    if (!member) return <span className="text-muted-foreground italic">Miembro desconocido</span>;

    return (
        <div className="flex items-center gap-3 group">
            <Avatar className="h-9 w-9 border border-border/50 bg-background transition-transform group-hover:scale-105">
                <AvatarImage src={member.image || undefined} alt={member.firstName} />
                <AvatarFallback className="text-xs font-bold bg-linear-to-br from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400">
                    {member.firstName[0]}{member.lastName[0]}
                </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
                <Link
                    href={`/${slug}/admin/members/${member.id}`}
                    className="font-medium text-sm text-foreground hover:text-primary transition-colors"
                >
                    {member.firstName} {member.lastName}
                </Link>
                <span className="text-[12px] text-muted-foreground font-primary">
                    {member.docType}: {member.docNumber || "N/A"}
                </span>
            </div>
        </div>
    );
};

const AttendanceActions = ({ attendance }: { attendance: AttendanceResponse }) => {
    const params = useParams();
    const slug = params.slug as string;
    const { mutate: deleteAttendance, isPending } = useDeleteAttendance();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleDelete = () => {
        deleteAttendance(attendance.id, {
            onSuccess: () => {
                setShowDeleteDialog(false);
                toast.success("Registro de asistencia eliminado");
            },
        });
    };

    if (!attendance.member) return null;

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
                            <Link href={`/${slug}/admin/attendances/${attendance.id}`} className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" /> Ver / Editar
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/${slug}/admin/members/${attendance.member.id}`} className="cursor-pointer">
                                <User className="mr-2 h-4 w-4" /> Ver Perfil Miembro
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => setShowDeleteDialog(true)}
                            className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar Registro
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-destructive flex items-center gap-2">
                            <Trash2 className="w-5 h-5" /> Eliminar registro
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará permanentemente el registro de asistencia de
                            <span className="font-medium text-foreground">
                                {" "}{attendance.member.firstName} {attendance.member.lastName}
                            </span>
                            {" "}del sistema.
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
export const columns: ColumnDef<AttendanceResponse>[] = [
    {
        accessorKey: "member",
        header: "Miembro",
        cell: ({ row }) => <MemberCell attendance={row.original} />,
    },
    {
        accessorKey: "date",
        header: "Fecha y Hora",
        cell: ({ row }) => {
            const date = new Date(row.getValue("date"));
            return (
                <div className="flex flex-col text-sm">
                    <div className="flex items-center gap-2 text-foreground font-medium">
                        <CalendarDays className="w-3.5 h-3.5 text-muted-foreground/70" />
                        <span>
                            {date.toLocaleDateString("es-PE", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                            })}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mt-0.5 ml-0.5">
                        <Clock className="w-3 h-3 opacity-70" />
                        <span className="font-primary">
                            {date.toLocaleTimeString("es-PE", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true
                            })}
                        </span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "method",
        header: "Método",
        cell: ({ row }) => {
            const method = row.getValue("method") as string;
            const isQR = method === "QR";

            return (
                <Badge
                    variant="outline"
                    className={cn("gap-1.5 font-normal shadow-xs", getMethodStyles(method))}
                >
                    {isQR ? (
                        <QrCode className="w-3 h-3" />
                    ) : (
                        <Hand className="w-3 h-3" />
                    )}
                    {isQR ? "Escaneo QR" : "Manual"}
                </Badge>
            );
        },
    },
    {
        id: "actions",
        enableHiding: false,
        header: () => <div className="text-right">Acciones</div>,
        cell: ({ row }) => <AttendanceActions attendance={row.original} />,
    },
];