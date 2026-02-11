"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AttendanceWithMember } from "@/server/application/repositories/attendance.repository.interface";
import { Users, QrCode, Hand, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export const columns: ColumnDef<AttendanceWithMember>[] = [
    {
        accessorKey: "member",
        header: "Miembro",
        cell: ({ row }) => {
            const attendance = row.original;
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
                        <span className="font-medium text-foreground">
                            {member.firstName} {member.lastName}
                        </span>
                    </div>
                </div>
            );
        },
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
];
