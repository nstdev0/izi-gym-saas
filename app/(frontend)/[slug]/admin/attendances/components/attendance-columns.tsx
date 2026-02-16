"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AttendanceWithMember } from "@/server/application/repositories/attendance.repository.interface";
import { Users, QrCode, Hand, CalendarDays, Eye, Trash2 } from "lucide-react";
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
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useDeleteAttendance } from "@/hooks/attendance/use-attendance";
import { useState } from "react";

// Component for Actions to correctly use hooks and mutations
const AttendanceActions = ({ attendance }: { attendance: AttendanceWithMember }) => {
    const params = useParams();
    const slug = params.slug as string;
    const { mutate: deleteAttendance, isPending } = useDeleteAttendance();
    const [open, setOpen] = useState(false);

    const handleDelete = () => {
        deleteAttendance(attendance.id, {
            onSuccess: () => {
                setOpen(false);
            },
        });
    };

    const member = attendance.member;

    return (
        <div className="flex justify-center">
            <Link href={`/${slug}/admin/attendance/${attendance.id}`}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Eye className="w-4 h-4" />
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
                            Esta acción no se puede deshacer. Esto eliminará el registro de asistencia de
                            <span className="font-medium text-foreground">
                                {" "}
                                {member.firstName} {member.lastName}
                            </span>{" "}
                            del {new Date(attendance.date).toLocaleDateString("es-ES")}.
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
// Component for the Member Name cell — renders as a link to the member detail page
const MemberCell = ({ attendance }: { attendance: AttendanceWithMember }) => {
    const params = useParams();
    const slug = params.slug as string;
    const member = attendance.member;

    return (
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                {member.image ? (
                    <Image
                        src={member.image}
                        alt={`${member.firstName} ${member.lastName}`}
                        width={32}
                        height={32}
                        className="rounded-full"
                    />
                ) : (
                    <Users className="w-4 h-4 text-primary" />
                )}
            </div>
            <div>
                <Link
                    href={`/${slug}/admin/members/${member.id}`}
                    className="font-medium text-foreground hover:underline"
                >
                    {member.firstName} {member.lastName}
                </Link>
            </div>
        </div>
    );
};

export const columns: ColumnDef<AttendanceWithMember>[] = [
    {
        accessorKey: "member",
        header: "Miembro",
        cell: ({ row }) => <MemberCell attendance={row.original} />,
    },
    {
        accessorKey: "date",
        header: "Fecha",
        cell: ({ row }) => {
            const date = new Date(row.getValue("date"));
            return (
                <div className="flex items-center gap-2 text-foreground">
                    <CalendarDays className="w-4 h-4 text-muted-foreground" />
                    <span>
                        {date.toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                        })}
                    </span>
                    <span className="text-muted-foreground text-sm">
                        {date.toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </span>
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
                    variant={isQR ? "default" : "secondary"}
                    className="gap-1.5"
                >
                    {isQR ? (
                        <QrCode className="w-3 h-3" />
                    ) : (
                        <Hand className="w-3 h-3" />
                    )}
                    {isQR ? "QR" : "Manual"}
                </Badge>
            );
        },
    },
    {
        accessorKey: "createdAt",
        header: "Registrado",
        cell: ({ row }) => {
            return (
                <div className="text-muted-foreground text-sm">
                    {new Date(row.getValue("createdAt")).toLocaleDateString("es-ES")}
                </div>
            );
        },
    },
    {
        id: "actions",
        enableHiding: false,
        header: () => <div className="text-center">Acciones</div>,
        cell: ({ row }) => <AttendanceActions attendance={row.original} />,
    },
];

